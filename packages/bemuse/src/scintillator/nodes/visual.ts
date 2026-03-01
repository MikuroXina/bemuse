import keytime, { type Property, type Timeline } from 'keytime'
import {
  Assets,
  BitmapText,
  Container,
  Graphics,
  Particle,
  ParticleContainer,
  Sprite,
  Text,
  type TextStyleAlign,
  type TextStyleFontWeight,
  Texture,
} from 'pixi.js'

import { compileExpression } from '../expression/index.js'
import type { Context, SkinNodeComponent } from './index.js'
import { parseFrame } from './lib/utils.js'

const containerAccessors = (
  container: Container
): Record<string, (value: unknown) => void> => ({
  x: (val) => (container.x = val as number),
  y: (val) => (container.y = val as number),
  'scale-x': (val) => (container.scale.x = val as number),
  'scale-y': (val) => (container.scale.y = val as number),
  alpha: (val) => (container.alpha = val as number),
  width: (val) => (container.width = val as number),
  height: (val) => (container.height = val as number),
  visible: (val) => (container.visible = val as boolean),
})

export const visual: SkinNodeComponent = (element) => async (ctx) => {
  let container: Container
  switch (element.nodeName) {
    case 'use': {
      const def = element.getAttribute('def')
      if (!def) {
        throw new Error('expected def attribute on use')
      }
      if (!Object.hasOwn(ctx.defs, def)) {
        throw new Error(`undefined referencing node: ${def}`)
      }
      return ctx.defs[def](ctx)
    }
    case 'group': {
      container = new Container()
      const maskFrame = parseFrame(element.getAttribute('mask') ?? '')
      if (maskFrame != null) {
        const maskShape = new Graphics().rect(
          maskFrame.x,
          maskFrame.y,
          maskFrame.width,
          maskFrame.height
        )
        container.mask = maskShape
      }
      const subs = await visuals(element.children, ctx)
      if (subs.length !== 0) {
        container.addChild(...subs)
      }
      break
    }
    case 'if': {
      container = new Container()
      const key = element.getAttribute('key')
      const matchValue = element.getAttribute('value')
      if (key == null || matchValue == null) {
        throw new Error('expected if node has key and value attribute')
      }
      container.label = `if (${key} === '${matchValue}')`

      const keyExpr = compileExpression(key)
      const subs = await visuals(element.children, ctx)
      let state = false
      ctx.stateSubject.on((env) => {
        const newState = keyExpr(env) === matchValue
        if (state === newState) {
          return
        }
        state = newState
        if (state) {
          container.addChild(...subs)
        } else {
          container.removeChild(...subs)
        }
      })
      break
    }
    case 'sprite': {
      container = new Sprite(await buildTexture(element))
      container.label = element.getAttribute('image')!
      break
    }
    case 'text': {
      const fontFamily = element.getAttribute('font-family') ?? undefined
      const fontWeight = element.getAttribute('font-weight') ?? undefined
      const fontSize = element.getAttribute('font-size') ?? undefined
      const text = element.getAttribute('text') ?? ''
      const data = compileExpression(element.getAttribute('data') || '0')
      const ttf = !element.getAttribute('font-src')
      const fill = element.getAttribute('fill') ?? undefined
      const align = element.getAttribute('align')
      const xRelativePos = align === 'left' ? 0 : align === 'right' ? 1 : 0.5

      container = ttf
        ? new Text({
            text,
            style: {
              fontFamily,
              fontWeight: fontWeight as TextStyleFontWeight | undefined,
              fontSize,
              fill,
              align: align as TextStyleAlign | undefined,
            },
            anchor: {
              x: xRelativePos,
              y: 0,
            },
          })
        : new BitmapText({
            text,
            style: {
              fontFamily,
              fontSize,
              align: align as TextStyleAlign | undefined,
            },
            anchor: {
              x: xRelativePos,
              y: 0,
            },
          })
      container.label = data.toString()

      ctx.stateSubject.on((env) => {
        const target = data(env)
        ;(container as Text).text = text.replace('%s', target as string)
      })
      break
    }
    case 'object': {
      const key = element.getAttribute('key')
      if (key == null) {
        throw new Error('expected element has key attribute')
      }
      const objectsExpr = compileExpression(key)
      container = new ParticleContainer({
        dynamicProperties: {
          position: true,
          alpha: true,
        },
      })
      container.label = key

      if (element.children.length !== 1) {
        throw new Error('expected exactly one child')
      }
      const particleSpriteElement = element.children.item(0)!
      const texture = await buildTexture(particleSpriteElement)
      ctx.stateSubject.on((env) => {
        const extracted = objectsExpr(env)
        if (!Array.isArray(extracted)) {
          return
        }
        ;(container as ParticleContainer).removeParticles()
        const particles = extracted as {
          key: string
          [otherKey: string]: unknown
        }[]
        for (const { key, ...particleEnv } of particles) {
          const particle = new Particle(texture)
          ;(container as ParticleContainer).addParticle(particle)
          let alphaMemo = 1
          const updaters = updatersFor(
            {
              x: (val) => (particle.x = val as number),
              y: (val) => (particle.y = val as number),
              'scale-x': (val) => (particle.scaleX = val as number),
              'scale-y': (val) => (particle.scaleY = val as number),
              alpha: (val) => (particle.alpha = alphaMemo = val as number),
              width: (val) =>
                (particle.scaleX = (val as number) / texture.width),
              height: (val) =>
                (particle.scaleY = (val as number) / texture.height),
              visible: (val) => (particle.alpha = val ? alphaMemo : 0),
            },
            particleSpriteElement
          )
          for (const updater of updaters) {
            updater(particleEnv)
          }
        }
      })
      break
    }
    case 'animation':
      return null
    default: {
      throw new Error(`unexpected node name: ${element.nodeName}`)
    }
  }
  const accessors = containerAccessors(container)
  for (const updater of updatersFor(accessors, element)) {
    ctx.stateSubject.on(updater)
  }

  const blendMode = element.getAttribute('blend') ?? 'normal'
  if (blendMode === 'normal' || blendMode === 'screen') {
    container.blendMode = blendMode
  } else {
    throw new Error(`invalid blend mode: ${blendMode}`)
  }
  const ref = element.getAttribute('ref')
  if (ref !== null) {
    if (!ctx.refs.has(ref)) {
      ctx.refs.set(ref, new Set())
    }
    ctx.refs.get(ref)!.add(container)
  }
  for (const animation of Array.from(
    element.querySelectorAll(':scope > animation')
  )) {
    const condition = animation.getAttribute('on')
    const timeExpr = compileExpression(element.getAttribute('t') ?? 't')
    const timeline = parseAnimation(animation)
    ctx.stateSubject.on((env) => {
      if (condition !== null && !(condition in env)) {
        return
      }
      const eventStartTime = condition == null ? 0 : (env[condition] as number)
      const time = (timeExpr(env) as number) - eventStartTime
      const animated = timeline.values(time)
      for (const [key, accessor] of Object.entries(accessors)) {
        if (animated[key] !== undefined) {
          accessor(animated[key])
        }
      }
    })
  }
  return container
}

const parseAnimation = (animation: Element): Timeline<Property[]> => {
  const keyframeDefs: Map<string, Property> = new Map()
  for (const keyframe of Array.from(
    animation.querySelectorAll(':scope > keyframe')
  )) {
    const t = keyframe.getAttribute('t')
    if (t == null) {
      throw new Error('expected keyframe has t attribute')
    }
    const time = Number(t)
    const ease = keyframe.getAttribute('ease') ?? undefined
    for (const attr of Array.from(keyframe.attributes)) {
      if (attr.name === 't' || attr.name === 'ease') {
        continue
      }
      if (!keyframeDefs.has(attr.name)) {
        keyframeDefs.set(attr.name, {
          name: attr.name,
          keyframes: [],
        })
      }
      keyframeDefs.get(attr.name)!.keyframes.push({
        time,
        value: Number(attr.value),
        ease,
      })
    }
  }
  return keytime([...keyframeDefs.values()])
}

function updatersFor(
  accessors: Record<string, (value: unknown) => void>,
  element: Element
): ((env: Record<string, unknown>) => void)[] {
  const handlers: ((env: Record<string, unknown>) => void)[] = []
  for (const name of Object.keys(accessors)) {
    const exprCode = element.getAttribute(name)
    if (exprCode == null) {
      continue
    }
    const expr = compileExpression(exprCode)
    if (expr.constant) {
      // if expr is a constant, the updater is unnecessary
      accessors[name](expr({}))
    } else {
      const handler = (env: Record<string, unknown>) => {
        accessors[name](expr(env))
      }
      handlers.push(handler)
    }
  }
  return handlers
}

async function buildTexture(element: Element): Promise<Texture> {
  const image = element.getAttribute('image')
  if (image == null) {
    throw new Error('expected element has image attribute')
  }
  const anchorX = Number(element.getAttribute('anchor-x') ?? '0')
  const anchorY = Number(element.getAttribute('anchor-y') ?? '0')

  return await Assets.load<Texture>({
    alias: image,
    data: {
      scaleMode: 'nearest',
      defaultAnchor: { x: anchorX, y: anchorY },
    },
  })
}

export const visuals = async (
  children: HTMLCollection,
  ctx: Context
): Promise<Container[]> => {
  const ret: Container[] = []
  for (let i = 0; i < children.length; ++i) {
    const child = children.item(i)!
    const sub = await visual(child)(ctx)
    if (sub !== null) {
      ret.push(sub)
    }
  }
  return ret
}
