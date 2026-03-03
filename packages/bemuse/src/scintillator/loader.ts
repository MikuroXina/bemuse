import type Progress from '@bemuse/progress'
import debug from 'debug'
import { Application, Assets, Container } from 'pixi.js'

import { SelectorSubject } from './nodes/index.js'
import { root } from './nodes/root.js'
import type { Skin } from './skin.js'

const log = debug('scintillator:loader')

export interface Scintillator {
  app: Application
  skin: Skin
  stateSubject: SelectorSubject
  refs: Map<string, Set<Container>>
}

export async function load(
  xmlPath: string,
  progress?: Progress
): Promise<Scintillator> {
  log('load XML from %s', xmlPath)
  const xml = await loadXml(xmlPath)

  // scan all images
  const paths = new Set<string>()
  for (const element of Array.from(xml.querySelectorAll('[image]'))) {
    paths.add(element.getAttribute('image')!)
  }
  for (const element of Array.from(xml.querySelectorAll('[font-src]'))) {
    paths.add(element.getAttribute('font-src')!)
  }
  const base = new URL(xmlPath, location.href)
  const baseStr = base.toString()

  // preload all images + progress reporting
  await loadResources(
    baseStr.substring(0, baseStr.lastIndexOf('/')),
    [...paths],
    progress
  )

  // compile the skin
  log('compiling')
  const stateSubject = new SelectorSubject()
  const rootItems = await root(xml, stateSubject)
  return { ...rootItems, stateSubject }
}

async function loadXml(xmlUrl: string): Promise<Element> {
  const res = await fetch(xmlUrl)
  const text = await res.text()
  return new DOMParser().parseFromString(text, 'text/xml')
    .documentElement as Element
}

async function loadResources(
  basePath: string,
  paths: readonly string[],
  progress?: Progress
): Promise<void> {
  log('loading resources')
  await Assets.init({ basePath })
  await Assets.load(paths, (ratio) => {
    progress?.report(ratio, 1.0)
  })
  log('resources finished loading')
}
