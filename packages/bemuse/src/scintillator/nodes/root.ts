import type { Subject } from '@bemuse/utils/subject.js'
import { Application, Container } from 'pixi.js'

import type Resources from '../resources.js'
import {
  isDisplayMode,
  isInfoPanelPosition,
  isInputDevice,
  type Skin,
} from '../skin.js'
import type { SkinNode } from './index.js'
import { visual } from './visual.js'

export const root = async (
  element: Element,
  resources: Resources,
  stateSubject: Subject<Record<string, unknown>>
): Promise<{
  app: Application
  skin: Skin
  refs: Map<string, Set<Container>>
}> => {
  if (element.nodeName !== 'skin') {
    throw new Error('expected skin node')
  }
  const app = new Application()
  const width = parseInt(element.getAttribute('width') ?? '', 10)
  const height = parseInt(element.getAttribute('height') ?? '', 10)

  await app.init({
    backgroundColor: 0x090807,
  })

  const defs: Record<string, SkinNode> = {}
  const refs = new Map<string, Set<Container>>()
  for (const child of Array.from(element.children)) {
    if (child.nodeName === 'defs') {
      const defBody = child.children.item(0)
      if (defBody === null) {
        throw new Error('expected body element in defs')
      }
      const id = defBody.getAttribute('id')
      if (!id) {
        throw new Error('expected id attribute on defs')
      }
      if (id in defs) {
        throw new Error(`defs had duplicated id ${id}`)
      }
      defs[id] = visual(defBody)
    } else {
      const sub = visual(child)({ defs, refs, resources, stateSubject })
      if (sub !== null) {
        app.stage.addChild(sub)
      }
    }
  }
  const mainInputDevice = element.getAttribute('data-main-input-device')
  const displayMode = element.getAttribute('data-display-mode')
  const infoPanelPosition = element.getAttribute('data-info-panel-position')
  return {
    app,
    skin: {
      width,
      height,
      mainInputDevice: isInputDevice(mainInputDevice)
        ? mainInputDevice
        : 'keyboard',
      displayMode: isDisplayMode(displayMode) ? displayMode : 'normal',
      infoPanelPosition: isInfoPanelPosition(infoPanelPosition)
        ? infoPanelPosition
        : 'bottom',
    },
    refs,
  }
}
