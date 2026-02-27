import $ from 'jquery'
import keytime, { type Property, type Timeline } from 'keytime'
import maxBy from 'lodash/maxBy'

export interface AnimationDef {
  on: string
  data: Property[]
}

const createKeytime = (def: AnimationDef) => ({
  ...def,
  data: keytime(def.data),
})

export class Animation {
  _timeKey: string
  _properties: Set<string>
  _animations: { on: string; data: Timeline<Property[]> }[]
  _events: readonly string[]

  constructor(animations: AnimationDef[], timeKey?: string) {
    this._timeKey = timeKey ?? 't'
    this._properties = new Set(
      animations.flatMap((animation) => animation.data.map((prop) => prop.name))
    )
    this._animations = animations.map(createKeytime)
    this._events = [...new Set(animations.map(({ on }) => on))]
  }

  prop(
    name: string,
    fallback: (data: Record<string, number>) => number
  ): (data: Record<string, number>) => number {
    if (!this._properties.has(name)) {
      return fallback
    }
    return (data) => {
      const values = this._getAnimation(data)
      if (Object.hasOwn(values, name)) {
        return values[name]
      } else {
        return fallback(data)
      }
    }
  }

  _getAnimation(data: Record<string, number>): Record<string, number> {
    const event = maxBy(
      this._events.filter((e) => e === '' || e in data),
      (e) => data[e] || 0
    )!
    const t = data[this._timeKey] - (data[event] || 0)
    const animations = this._animations.filter((a) => a.on === event)
    const values = animations.map((a) => a.data.values(t))
    return Object.assign({}, ...values)
  }

  static compile(_compiler: unknown, $el: JQuery) {
    const animationElements = Array.from($el.children('animation'))
    const animations = animationElements.map((el) => _compile($(el)))
    const timeKey = $el.attr('t') ?? 't'
    return new Animation(animations, timeKey)
  }
}

export function _compile($el: JQuery): AnimationDef {
  const keyframes = Array.from($el.children('keyframe')).map(_attrs)
  const attrs: Record<string, Property> = {}
  for (const keyframe of keyframes) {
    const time = +keyframe.t
    const ease = keyframe.ease || 'linear'
    if (isNaN(time)) throw new Error('Expected keyframe to have "t" attribute')
    for (const key in keyframe) {
      if (key === 't' || key === 'ease') continue
      const value = +keyframe[key]
      const attr = attrs[key] ?? (attrs[key] = _createKeyframes(key))
      attr.keyframes.push({ time, value, ease })
    }
  }
  return {
    on: $el.attr('on') ?? '',
    data: Object.values(attrs),
  }
}

function _createKeyframes(name: string): Property {
  return { name, keyframes: [] }
}

export function _attrs(el: HTMLElement) {
  return Object.fromEntries(
    [...new Array(el.attributes.length)]
      .map((_, i) => el.attributes[i])
      .map((attr) => [attr.name.toLowerCase(), attr.value])
  )
}

export default Animation
