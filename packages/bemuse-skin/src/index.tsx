import type { JSX } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Screen } from './template/screen.js'
import { Touch } from './template/touch.js'
import { Touch3d } from './template/touch3d.js'

export { Screen, Touch, Touch3d }

export * as Atom from './atom.js'
export * as Common from './common.js'

export function renderToXml(element: JSX.Element): string {
  const content = renderToStaticMarkup(element)
  const xml = '<?xml version="1.0" encoding="utf-8" ?>\n' + content
  return xml
}
