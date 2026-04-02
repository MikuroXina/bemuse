import type Progress from '@bemuse/progress'
import { renderToXml } from '@mikuroxina/bemuse-skin'
import debug from 'debug'
import { Application, Assets, Container } from 'pixi.js'
import type { JSX } from 'react'

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
  xmlComponent: () => JSX.Element,
  progress?: Progress
): Promise<Scintillator> {
  const xmlSrc = renderToXml(xmlComponent())
  const xml = new DOMParser().parseFromString(xmlSrc, 'text/xml')
    .documentElement as Element

  // scan all images
  const paths = new Set<string>()
  for (const element of Array.from(xml.querySelectorAll('[image]'))) {
    paths.add(element.getAttribute('image')!)
  }
  for (const element of Array.from(xml.querySelectorAll('[font-src]'))) {
    paths.add(element.getAttribute('font-src')!)
  }

  // preload all images + progress reporting
  await loadResources([...paths], progress)

  // compile the skin
  log('compiling')
  const stateSubject = new SelectorSubject()
  const rootItems = await root(xml, stateSubject)
  return { ...rootItems, stateSubject }
}

async function loadResources(
  paths: readonly string[],
  progress?: Progress
): Promise<void> {
  log('loading resources')
  await Assets.init()
  await Assets.load(paths, (ratio) => {
    progress?.report(ratio, 1.0)
  })
  log('resources finished loading')
}
