import meticulousFont from '@bemuse/../public/skins/default/Fonts/BemuseDefault-Meticulous.fnt'
import otherFont from '@bemuse/../public/skins/default/Fonts/BemuseDefault-Other.fnt'
import MAIN from '@bemuse/utils/main-element'
import { Application, Assets, autoDetectRenderer, BitmapText } from 'pixi.js'

export async function main() {
  await autoDetectRenderer({
    width: 640,
    height: 480,
  })

  const app = new Application()
  await app.init({
    backgroundColor: 0x8b8685,
  })

  const urls = [meticulousFont, otherFont]
  await Assets.load(urls)

  const text = new BitmapText({
    text: '*1234567890',
    font: 'BemuseDefault-Meticulous',
  })
  app.stage.addChild(text)
  const text2 = new BitmapText({
    text: '01',
    font: 'BemuseDefault-Other',
  })
  text2.y = 100
  app.stage.addChild(text2)

  MAIN.appendChild(app.canvas)
}
