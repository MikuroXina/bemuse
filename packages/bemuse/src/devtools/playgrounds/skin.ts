import GameDisplay from '@bemuse/game/display'
import Game from '@bemuse/game/game'
import type GameTimer from '@bemuse/game/game-timer'
import GameInput from '@bemuse/game/input'
import GameState from '@bemuse/game/state'
import * as Scintillator from '@bemuse/scintillator'
import MAIN from '@bemuse/utils/main-element'
import { fromBMSChart } from '@mikuroxina/bemuse-notechart/lib/loader/BMSNotechartLoader'
import { Compiler } from '@mikuroxina/bms'

export async function main() {
  const chart = Compiler.compile(`
    #TITLE ทดสอบ Bemuse
    #ARTIST ฟหกด
    #00111:01
    #00112:01
    #00113:01
    #00114:01
    #00115:01
    #00118:01
    #00119:01
    #00116:01
    #00151:0001010000000000
    #00152:0001010000000000
    #00153:0001010000000000
    #00154:0001010000000000
    #00155:0001010000000000
    #00158:0001010000000000
    #00159:0001010000000000
    #00156:0001010000000000
    #00211:010000000000000000010000
    #00212:000100000000000000010000
    #00213:010001000000000000010000
    #00214:010000010000000001000001
    #00215:010000000100000100000100
    #00218:010000000010010001000100
    #00219:010000000001000100000100`).chart

  const notecharts = [fromBMSChart(chart, { scratch: 'off' })]

  const game = new Game(notecharts, {
    players: [
      {
        speed: 2,
        input: {
          keyboard: {
            '1': 'KeyS',
            '2': 'KeyD',
            '3': 'KeyF',
            '4': 'Space',
            '5': 'KeyJ',
            '6': 'KeyK',
            '7': 'KeyL',
            SC: 'ShiftLeft',
            SC2: 'KeyA',
          },
        },
        scratch: 'off',
      },
    ],
    audioInputLatency: 0,
  })

  const skin = await Scintillator.load(
    Scintillator.getSkin({
      displayMode: 'touch3d',
    })
  )

  const display = new GameDisplay({ game, scintillator: skin, video: null })
  const state = new GameState(game)
  const input = new GameInput()
  const started = new Date().getTime()
  const timer = {
    time: 0,
    started: true,
    startTime: started,
    readyFraction: 0,
  } as unknown as GameTimer

  display.start()
  display._getData = ((getData) =>
    function (...params) {
      const result = getData.apply(display, params)
      result['p1_score'] = (new Date().getTime() - started) % 555556
      ;(window as unknown as Record<string, unknown>).LATEST_DATA = result
      return result
    })(display._getData)

  const draw = () => {
    const t = (new Date().getTime() - started) / 1000
    timer.time = t
    state.update(t, input, timer)
    display.update(t, state)
  }
  draw()
  requestAnimationFrame(function f() {
    draw()
    requestAnimationFrame(f)
  })

  showCanvas(skin.app.canvas)
}

function showCanvas(view: HTMLCanvasElement) {
  const { width, height } = view

  view.style.display = 'block'
  view.style.margin = '0 auto'

  MAIN?.appendChild(view)
  resize()
  window.addEventListener('resize', resize)

  function resize() {
    const scale = Math.min(
      window.innerWidth / width,
      window.innerHeight / height
    )
    view.style.width = Math.round(width * scale) + 'px'
    view.style.height = Math.round(height * scale) + 'px'
  }
}
