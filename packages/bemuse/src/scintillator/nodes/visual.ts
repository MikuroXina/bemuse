import keytime, { type Property, type Timeline } from 'keytime'
import {
  Assets,
  BitmapText,
  Container,
  Graphics,
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
        const maskShape = new Graphics()
          .rect(maskFrame.x, maskFrame.y, maskFrame.width, maskFrame.height)
          .fill(0xffffff)
        container.addChild(maskShape)
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
      ctx.stateSubject.on(
        (env) => (keyExpr(env) === matchValue) as boolean,
        (state) => {
          if (state) {
            container.addChild(...subs)
          } else {
            container.removeChild(...subs)
          }
        }
      )
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

      const data = element.getAttribute('data')
      if (data == null) {
        container.label = text
      } else {
        container.label = data.toString()
        const dataExpr = compileExpression(data)
        ctx.stateSubject.on(
          (env) => dataExpr(env) as string,
          (target) => {
            ;(container as Text).text = text.replace('%s', target as string)
          }
        )
      }
      break
    }
    case 'object': {
      const key = element.getAttribute('key')
      if (key == null) {
        throw new Error('expected element has key attribute')
      }
      const poolLen = parseInt(element.getAttribute('pool') ?? '0', 10)
      const objectsExpr = compileExpression(key)
      container = new Container()
      container.label = key

      if (element.children.length !== 1) {
        throw new Error('expected exactly one child')
      }
      const particleSpriteElement = element.children.item(0)!
      const blendMode = particleSpriteElement.getAttribute('blend') ?? 'normal'
      const texture = await buildTexture(particleSpriteElement)
      const newSprite = () => {
        const sprite = new Sprite(texture)
        if (blendMode === 'normal' || blendMode === 'screen') {
          sprite.blendMode = blendMode
        }
        return sprite
      }
      const pool = [...new Array(poolLen)].map(newSprite)
      const prevParticles = new Map<string, Sprite>()
      ctx.stateSubject.on(
        (env) => objectsExpr(env),
        (extracted) => {
          if (!Array.isArray(extracted)) {
            extracted = []
          }

          const particles = extracted as {
            key: string
            [otherKey: string]: unknown
          }[]
          const particlesMap = new Map(
            particles.map(({ key, ...others }) => [key, others])
          )
          const keysToDelete: string[] = []
          for (const prevKey of prevParticles.keys()) {
            if (!particlesMap.has(prevKey)) {
              keysToDelete.push(prevKey)
            }
          }
          for (const toDelete of keysToDelete) {
            const deleting = prevParticles.get(toDelete)!
            prevParticles.delete(toDelete)
            pool.push(deleting)
            container.removeChild(deleting)
          }

          for (const [nowKey, nowEnv] of particlesMap.entries()) {
            let particle: Sprite
            if (prevParticles.has(nowKey)) {
              particle = prevParticles.get(nowKey)!
            } else {
              if (pool.length === 0) {
                particle = newSprite()
              } else {
                particle = pool.pop()!
              }
              prevParticles.set(nowKey, particle)
              container.addChild(particle)
            }

            const updaters = updatersFor(
              {
                x: (val) => (particle.x = val as number),
                y: (val) => (particle.y = val as number),
                'scale-x': (val) => (particle.scale.x = val as number),
                'scale-y': (val) => (particle.scale.y = val as number),
                alpha: (val) => (particle.alpha = val as number),
                width: (val) => (particle.width = val as number),
                height: (val) => (particle.height = val as number),
                visible: (val) => (particle.visible = val as boolean),
              },
              particleSpriteElement
            )
            for (const [selector, updater] of updaters) {
              updater(selector(nowEnv))
            }
          }
        }
      )
      break
    }
    case 'animation':
      return null
    default: {
      throw new Error(`unexpected node name: ${element.nodeName}`)
    }
  }
  const accessors = containerAccessors(container)
  for (const [selector, updater] of updatersFor(accessors, element)) {
    ctx.stateSubject.on(selector, updater)
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

  const timelines = new Map<string, Timeline<Property[]>>()
  const timeExpr = compileExpression(element.getAttribute('t') ?? 't')
  for (const animation of Array.from(
    element.querySelectorAll(':scope > animation')
  )) {
    const condition = animation.getAttribute('on')
    const timeline = parseAnimation(animation)
    timelines.set(condition ?? '', timeline)
  }
  ctx.stateSubject.on(
    (env) =>
      [
        timeExpr(env) as number,
        [...timelines.keys()]
          .filter((key) => key === '' || key in env)
          .reduce<[number, string]>(
            ([prev, event], currEvent) => {
              const curr = (env[currEvent] as number | undefined) ?? 0
              return prev < curr ? [curr, currEvent] : [prev, event]
            },
            [0, '']
          ),
      ] as const,
    ([time, [eventStartTime, eventKey]]) => {
      if (!timelines.has(eventKey)) {
        return
      }
      const elapsed = time - eventStartTime
      const animated = timelines.get(eventKey)!.values(elapsed)
      for (const [key, accessor] of Object.entries(accessors)) {
        if (animated[key] !== undefined) {
          accessor(animated[key])
        }
      }
    }
  )
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
): [
  selector: (env: Record<string, unknown>) => unknown,
  updater: (env: unknown) => void,
][] {
  const handlers: [
    selector: (env: Record<string, unknown>) => unknown,
    updater: (env: unknown) => void,
  ][] = []
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
      handlers.push([expr, accessors[name]])
    }
  }
  return handlers
}

async function buildTexture(element: Element): Promise<Texture> {
  const image = element.getAttribute('image')
  if (image == null) {
    throw new Error('expected element has image attribute')
  }

  const texture = await Assets.load<Texture>(image)
  const frame = parseFrame(element.getAttribute('frame') ?? '') ?? undefined
  const anchorX = Number(element.getAttribute('anchor-x') ?? '0')
  const anchorY = Number(element.getAttribute('anchor-y') ?? '0')
  return new Texture({
    source: texture.source,
    frame,
    defaultAnchor: { x: anchorX, y: anchorY },
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
