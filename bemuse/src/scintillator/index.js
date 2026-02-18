import touchSkin from '@bemuse/../../public/skins/default/skin_touch.xml'
import touch3dSkin from '@bemuse/../../public/skins/default/skin_touch3d.xml'
import screenSkin from '@bemuse/../../public/skins/default/skin_screen.xml'

import { Context } from './context'
import { load } from './loader'

export { load, Context }

export function getSkinUrl({ displayMode } = {}) {
  if (displayMode === 'touch3d') {
    return touch3dSkin
  } else {
    if (window.innerWidth < window.innerHeight) {
      return touchSkin
    } else {
      return screenSkin
    }
  }
}
