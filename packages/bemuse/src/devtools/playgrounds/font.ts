import MAIN from '@bemuse/utils/main-element'
import { Application, Assets, autoDetectRenderer, BitmapText } from 'pixi.js'

const meticulousFont = '/Fonts/BemuseDefault-Meticulous.fnt'
const otherFont = '/Fonts/BemuseDefault-Other.fnt'

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
  console.dir({ urls })
  await Assets.load(urls)

  const text = new BitmapText({
    text: '*1234567890',
    style: {
      fontFamily: 'BemuseDefault-Meticulous',
      fontSize: '40px',
    },
  })
  app.stage.addChild(text)
  const text2 = new BitmapText({
    text: '01',
    style: {
      fontFamily: 'BemuseDefault-Other',
      fontSize: '40px',
    },
  })
  text2.y = 100
  app.stage.addChild(text2)

  MAIN?.appendChild(app.canvas)
}
