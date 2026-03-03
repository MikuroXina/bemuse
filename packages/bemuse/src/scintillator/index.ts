import { load, type Scintillator } from './loader'
import type { DisplayMode } from './skin'

export { type DisplayMode, load, type Scintillator }

export function getSkinUrl({
  displayMode,
}: { displayMode?: DisplayMode } = {}): string {
  if (displayMode === 'touch3d') {
    return '/skins/default/skin_touch3d.xml'
  } else {
    if (window.innerWidth < window.innerHeight) {
      return '/skins/default/skin_touch.xml'
    } else {
      return '/skins/default/skin_screen.xml'
    }
  }
}
