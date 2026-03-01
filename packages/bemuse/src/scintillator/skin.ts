export const inputDevices = ['keyboard', 'touch'] as const
export type InputDevice = (typeof inputDevices)[number]
export const isInputDevice = (x: unknown): x is InputDevice =>
  (inputDevices as readonly string[]).includes(x as string)

export const displayModes = ['normal', 'touch3d'] as const
export type DisplayMode = (typeof displayModes)[number]
export const isDisplayMode = (x: unknown): x is DisplayMode =>
  (displayModes as readonly string[]).includes(x as string)

export const infoPanelPositions = ['bottom', 'top'] as const
export type InfoPanelPosition = (typeof infoPanelPositions)[number]
export const isInfoPanelPosition = (x: unknown): x is InfoPanelPosition =>
  (infoPanelPositions as readonly string[]).includes(x as string)

export interface Skin {
  width: number
  height: number
  mainInputDevice: InputDevice
  displayMode: DisplayMode
  infoPanelPosition: InfoPanelPosition
}
