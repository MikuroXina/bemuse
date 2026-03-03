import { OmniInput } from '@bemuse/omni-input'

import { DualInput } from './dual-input'

function OmniInputPlugin(game) {
  const input = new OmniInput(window, {
    exclusive: true,
    continuous: game.players[0].options.input.continuous,
    sensitivity: game.players[0].options.input.sensitivity,
  })
  const kbm = game.players[0].options.input.keyboard
  const scratch = new DualInput()

  // Don't use Btn8 or Btn9 if they are binded
  // TODO: make start and select button bindable
  const isBtn8Free = Object.values(kbm).indexOf('gamepad.0.button.8') < 0
  const isBtn9Free = Object.values(kbm).indexOf('gamepad.0.button.9') < 0

  return {
    name: 'GameKBPlugin',
    get() {
      const data = input.update()

      const result = {
        p1_1: data[kbm['1'] ?? 'KeyS'] ? 1 : 0,
        p1_2: data[kbm['2'] ?? 'KeyD'] ? 1 : 0,
        p1_3: data[kbm['3'] ?? 'KeyF'] ? 1 : 0,
        p1_4: data[kbm['4'] ?? 'Space'] ? 1 : 0,
        p1_5: data[kbm['5'] ?? 'KeyJ'] ? 1 : 0,
        p1_6: data[kbm['6'] ?? 'KeyK'] ? 1 : 0,
        p1_7: data[kbm['7'] ?? 'KeyL'] ? 1 : 0,
        p1_SC: scratch.combine(
          data[kbm['SC'] || 'KeyA'],
          data[kbm['SC2'] || 'ShiftLeft']
        ),
        p1_speedup: data['ArrowUp'] ? 1 : 0,
        p1_speeddown: data['ArrowDown'] ? 1 : 0,
        start:
          data['Enter'] ?? ((isBtn9Free && data['gamepad.0.button.9']) || 0),
        select:
          data['AltLeft'] ?? ((isBtn8Free && data['gamepad.0.button.8']) || 0),
      }
      if (result['start'] || result['select']) {
        if (
          result['p1_1'] ||
          result['p1_3'] ||
          result['p1_5'] ||
          result['p1_7']
        ) {
          result['p1_speeddown'] = 1
        }
        if (result['p1_2'] || result['p1_4'] || result['p1_6']) {
          result['p1_speedup'] = 1
        }
      }
      return result
    },
    destroy() {
      input.dispose()
    },
  }
}

export default OmniInputPlugin
