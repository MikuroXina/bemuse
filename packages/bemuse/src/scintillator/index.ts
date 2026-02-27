import { Context } from './context'
import { load } from './loader'

export { Context, load }

export type DisplayMode = 'touch3d' | 'normal'

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
