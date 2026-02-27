import { Subject } from '@bemuse/utils/subject.js'
import { EventEmitter } from 'events'
import assert from 'power-assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { getName, OmniInput } from './index.js'

function fakeWindow() {
  const events = new EventEmitter()
  const gamepads = []
  const noop = () => {}
  return {
    addEventListener(name, callback) {
      events.on(name, callback)
    },
    removeEventListener(name, callback) {
      events.removeListener(name, callback)
    },
    setInterval(callback) {
      events.on('timeout', callback)
      return callback
    },
    clearInterval(callback) {
      events.removeListener('timeout', callback)
    },
    keydown(keyCode) {
      events.emit('keydown', { which: keyCode, preventDefault: noop })
    },
    keyup(keyCode) {
      events.emit('keyup', { which: keyCode, preventDefault: noop })
    },
    tick() {
      events.emit('timeout')
    },
    gamepads,
    navigator: {
      getGamepads() {
        return gamepads
      },
    },
  }
}

describe('OmniInput', function () {
  let window
  let input
  let midi
  beforeEach(function () {
    window = fakeWindow()
    const midiSubject = new Subject()
    input = new OmniInput(window, {
      getMidiStream: () => midiSubject,
    })
    midi = (...args) => {
      midiSubject.dispatch({
        data: args,
        target: { id: '1234' },
      })
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
    const input = new OmniInput(basicWindow)
    void input
  })

  describe('keyboard', function () {
    it('recognizes input', function () {
      window.keydown(32)
      assert(input.update()['32'])
      window.keyup(32)
      assert(!input.update()['32'])
    })
    it('returns the key name', function () {
      assert(getName('32') === 'Space')
      assert(getName('65') === 'A')
    })
  })

  describe('gamepad', function () {
    it('recognizes input', function () {
      window.gamepads.push(null, {
        index: 1,
        buttons: [{}, { value: 0.9 }],
        axes: [0, 0.9, -0.9],
      })
      const data = input.update()
      assert(!data['gamepad.1.button.0'])
      assert(data['gamepad.1.button.1'])
      assert(!data['gamepad.1.axis.0'])
      assert(!data['gamepad.1.axis.0.positive'])
      assert(!data['gamepad.1.axis.0.negative'])
      assert(data['gamepad.1.axis.1.positive'])
      assert(!data['gamepad.1.axis.1.negative'])
      assert(data['gamepad.1.axis.2.negative'])
      assert(!data['gamepad.1.axis.2.positive'])
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
