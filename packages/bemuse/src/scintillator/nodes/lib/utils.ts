import { Rectangle } from 'pixi.js'

export function parseFrame(text: string): Rectangle | null {
  let m = text.match(/^(\d+)x(\d+)\+(\d+)\+(\d+)$/)
  if (!m) {
    return null
  }
  return new Rectangle(+m[3], +m[4], +m[1], +m[2])
}
