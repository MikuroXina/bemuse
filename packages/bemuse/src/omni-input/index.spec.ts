import { Subject } from '@bemuse/utils/subject.js'
import { afterEach, assert, beforeEach, describe, expect, it } from 'vitest'

import { getName, OmniInput } from './index.js'

const noop = () => {}

class FakeWindow {
  readonly keydownSubject = new Subject<KeyboardEvent>()
  readonly keyupSubject = new Subject<KeyboardEvent>()
  gamepads: (Gamepad | null)[] = []
  addEventListener(name: string, callback: (x: unknown) => void) {
    if (name === 'keydown') {
      this.keydownSubject.on(callback)
    }
    if (name === 'keyup') {
      this.keyupSubject.on(callback)
    }
  }
  removeEventListener(name: string, callback: (x: unknown) => void) {
    if (name === 'keydown') {
      this.keydownSubject.off(callback)
    }
    if (name === 'keyup') {
      this.keyupSubject.off(callback)
    }
  }
  keydown(code: string) {
    this.keydownSubject.dispatch({
      code,
      preventDefault: noop,
    } as KeyboardEvent)
  }
  keyup(code: string) {
    this.keyupSubject.dispatch({ code, preventDefault: noop } as KeyboardEvent)
  }
  readonly navigator = {
    getGamepads: () => {
      return this.gamepads
    },
  }
}

describe('OmniInput', function () {
  let window: FakeWindow
  let input: OmniInput
  let midi: (...data: number[]) => void
  beforeEach(function () {
    window = new FakeWindow()
    const midiSubject = new Subject<MIDIMessageEvent>()
    input = new OmniInput(
      window as unknown as GlobalEventHandlers & {
        readonly navigator: Navigator
      },
      {
        getMidiStream: () => midiSubject,
      }
    )
    midi = (...data: number[]) => {
      midiSubject.dispatch({
        data: new Uint8Array(data),
        target: { type: 'input', id: '1234' } as MIDIPort,
      } as MIDIMessageEvent)
    }
  })

  afterEach(function () {
    input.dispose()
  })

  it('does not fail when browser support is limited', () => {
    const basicWindow = {
      addEventListener() {},
      removeEventListener() {},
      navigator: {},
    }
    const input = new OmniInput(
      basicWindow as unknown as GlobalEventHandlers & {
        readonly navigator: Navigator
      }
    )
    void input
  })

  describe('keyboard', function () {
    it('recognizes input', function () {
      window.keydown('Space')

      const state1 = input.update()
      expect(state1['Space']).toStrictEqual(true)

      window.keyup('Space')

      const state2 = input.update()
      expect(state2['Space']).toStrictEqual(false)
    })
    it('returns the key name', function () {
      expect(getName('32')).toStrictEqual('Space')
      expect(getName('65')).toStrictEqual('A')
    })
  })

  describe('gamepad', function () {
    it('recognizes input', function () {
      window.gamepads.push(null, {
        index: 1,
        buttons: [
          { value: 0.0, touched: false, pressed: false },
          { value: 0.9, touched: false, pressed: true },
        ],
        axes: [0, 0.9, -0.9],
      } as unknown as Gamepad)

      const data = input.update()
      console.dir(data)

      expect(data['gamepad.1.button.0']).toStrictEqual(false)
      expect(data['gamepad.1.button.1']).toStrictEqual(true)
      expect(data['gamepad.1.axis.0.positive']).toStrictEqual(false)
      expect(data['gamepad.1.axis.0.negative']).toStrictEqual(false)
      expect(data['gamepad.1.axis.1.positive']).toStrictEqual(true)
      expect(data['gamepad.1.axis.1.negative']).toStrictEqual(false)
      expect(data['gamepad.1.axis.2.negative']).toStrictEqual(true)
      expect(data['gamepad.1.axis.2.positive']).toStrictEqual(false)
    })
  })

  describe('midi', function () {
    it('handles notes', function () {
      midi(0x92, 0x40, 0x7f)
      assert(input.update()['midi.1234.2.note.64'], 'note on')
      midi(0x82, 0x40, 0x7f)
      assert(!input.update()['midi.1234.2.note.64'], 'note off')
      midi(0x92, 0x40, 0x7f)
      assert(input.update()['midi.1234.2.note.64'], 'note on')
      midi(0x92, 0x40, 0x00)
      assert(!input.update()['midi.1234.2.note.64'], 'note off with note on')
    })
    it('handles pitch bend', function () {
      midi(0xe1, 0x7f, 0x7f)
      assert(input.update()['midi.1234.1.pitch.up'])
      assert(!input.update()['midi.1234.1.pitch.down'])
      midi(0xe1, 0x7f, 0x1f)
      assert(input.update()['midi.1234.1.pitch.down'])
      assert(!input.update()['midi.1234.1.pitch.up'])
    })
    it('handles sustain pedal', function () {
      midi(0xbc, 0x40, 0x7f)
      assert(input.update()['midi.1234.12.sustain'])
      midi(0xbc, 0x40, 0x00)
      assert(!input.update()['midi.1234.12.sustain'])
    })
    it('handles modulation lever', function () {
      midi(0xbc, 0x01, 0x7f)
      assert(input.update()['midi.1234.12.mod'])
      midi(0xbc, 0x01, 0x00)
      assert(!input.update()['midi.1234.12.mod'])
    })
    it('returns the key name', function () {
      assert(getName('midi.1234.12.note.60').match(/C4/))
      assert(getName('midi.1234.12.pitch.up').match(/Pitch\+/))
      assert(getName('midi.1234.12.pitch.down').match(/Pitch-/))
      assert(getName('midi.1234.12.sustain').match(/Sustain/))
      assert(getName('midi.1234.12.mod').match(/Mod/))
    })
  })
})
