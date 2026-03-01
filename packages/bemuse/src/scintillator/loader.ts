import type Progress from '@bemuse/progress'
import { Subject } from '@bemuse/utils/subject.js'
import debug from 'debug'
import { Application, Assets, Container } from 'pixi.js'

import { root } from './nodes/root.js'
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
  const paths = new Set<string>()
  for (const element of Array.from(xml.querySelectorAll('[image]'))) {
    paths.add(element.getAttribute('image')!)
  }
  for (const element of Array.from(xml.querySelectorAll('[font-src]'))) {
    paths.add(element.getAttribute('font-src')!)
  }
  const base = new URL(xmlPath, location.href)
  const pathUrls: { path: string; url: string }[] = []
  for (const path of paths) {
    const assetUrl = new URL(path, base)
    if (assetUrl.protocol === 'file:') {
      const { pathname, search, hash } = assetUrl
      pathUrls.push({ path, url: pathname + search + hash })
    } else {
      pathUrls.push({ path, url: assetUrl.toString() })
    }
  }

  // preload all images + progress reporting
  await loadResources(pathUrls, progress)

  // compile the skin
  log('compiling')
  const stateSubject = new Subject<Record<string, unknown>>()
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
  pathUrls: readonly { path: string; url: string }[],
  progress?: Progress
): Promise<void> {
  log('loading resources')
  await Assets.init({
    texturePreference: {
      resolution: window.devicePixelRatio,
      format: ['avif', 'webp', 'png'],
    },
  })

  for (let i = 0; i < pathUrls.length; ++i) {
    await Assets.load({
      alias: pathUrls[i].path,
      src: pathUrls[i].url,
    })
    progress?.report(i + 1, pathUrls.length)
  }
  log('resources finished loading')
}
