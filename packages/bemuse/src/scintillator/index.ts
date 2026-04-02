import { Screen, Touch, Touch3d } from '@mikuroxina/bemuse-skin'
import type { JSX } from 'react'

import { load, type Scintillator } from './loader'
import type { DisplayMode } from './skin'

export { type DisplayMode, load, type Scintillator }

export function getSkin({
  displayMode,
}: { displayMode?: DisplayMode } = {}): () => JSX.Element {
  if (displayMode === 'touch3d') {
    return Touch3d
  } else {
    if (window.innerWidth < window.innerHeight) {
      return Touch
    } else {
      return Screen
    }
  }
}
