import type Progress from '@bemuse/progress'
import { Subject } from '@bemuse/utils/subject.js'
import debug from 'debug'
import { Application, Assets, Container } from 'pixi.js'

import { root } from './nodes/root.js'
import Resources from './resources.js'
import type { Skin } from './skin.js'

const log = debug('scintillator:loader')

export interface Scintillator {
  app: Application
  skin: Skin
  stateSubject: Subject<Record<string, unknown>>
  refs: Map<string, Set<Container>>
}

export async function load(
  xmlPath: string,
  progress?: Progress
): Promise<Scintillator> {
  log('load XML from %s', xmlPath)
  const xml = await loadXml(xmlPath)

  // scan all images
  const resources = new Resources()
  const paths = new Set<string>()
  for (const element of Array.from(xml.querySelectorAll('[image]'))) {
    paths.add(element.getAttribute('image')!)
  }
  for (const element of Array.from(xml.querySelectorAll('[font-src]'))) {
    paths.add(element.getAttribute('font-src')!)
  }
  const base = new URL(xmlPath, 'file://')
  for (const path of paths) {
    const assetUrl = new URL(path, base)
    if (assetUrl.protocol === 'file:') {
      const { pathname, search, hash } = assetUrl
      resources.add(path, pathname + search + hash)
    } else {
      resources.add(path, assetUrl.toString())
    }
  }

  // preload all images + progress reporting
  await preloadResources(resources, progress)

  // compile the skin
  log('compiling')
  const stateSubject = new Subject<Record<string, unknown>>()
  const rootItems = await root(xml, resources, stateSubject)
  return { ...rootItems, stateSubject }
}

async function loadXml(xmlUrl: string): Promise<Element> {
  const res = await fetch(xmlUrl)
  const text = await res.text()
  return new DOMParser().parseFromString(text, 'text/xml')
    .documentElement as Element
}

async function preloadResources(
  resources: Resources,
  progress?: Progress
): Promise<void> {
  log('loading resources')
  const urls = resources.urls
  for (let i = 0; i < urls.length; ++i) {
    await Assets.load({
      alias: urls[i],
      src: urls[i],
    })
    progress?.report(i + 1, resources.urls.length)
  }
  log('resources finished loading')
}
