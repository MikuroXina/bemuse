import type { JSX } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Screen } from './template/screen.js'
import { promises, type PathLike } from 'node:fs'
import path from 'node:path'
import { Touch } from './template/touch.js'
import { Touch3d } from './template/touch3d.js'

await main()

async function main(): Promise<void> {
  const outDir = 'out'
  await promises.mkdir(outDir, { recursive: true })

  await renderToXml(Screen(), path.join(outDir, 'skin_screen.xml'))
  await renderToXml(Touch(), path.join(outDir, 'skin_touch.xml'))
  await renderToXml(Touch3d(), path.join(outDir, 'skin_touch3d.xml'))
}

async function renderToXml(
  element: JSX.Element,
  path: PathLike
): Promise<void> {
  const content = renderToStaticMarkup(element)
  const xml = '<?xml version="1.0" encoding="utf-8" ?>\n' + content
  await promises.writeFile(path, xml)
}
