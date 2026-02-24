import { beforeEach, describe, expect, it, vi } from 'vitest'

import { playerWithBMS } from '../test-helpers/index.js'
import PlayerAudio from './player-audio.js'

describe('PlayerAudio', function () {
  const waveFactory = {
    playAuto: () => ({}),
    playNote: () => ({}),
    playFree: () => ({}),
  }
  let audio

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  function setup(player) {
    audio = new PlayerAudio({ player, waveFactory })
  }

  it('should play autokeysounds on correct time', function () {
    setup({
      notechart: {
        autos: [
          { time: 1, keysound: '0x' },
          { time: 2, keysound: '0y' },
          { time: 2, keysound: '0z' },
        ],
        notes: [],
      },
      options: {
        autosound: false,
      },
    })
    const playAutoMock = vi.spyOn(waveFactory, 'playAuto')

    audio.update(0)
    expect(playAutoMock).not.toHaveBeenCalled()
    audio.update(1)
    expect(playAutoMock).toHaveBeenCalledOnce()
    expect(playAutoMock.mock.calls[0][0]['keysound']).toStrictEqual('0x')
    audio.update(2)
    expect(playAutoMock).toHaveBeenCalledTimes(3)
  })

  it('should play notes automatically when autosound is on', function () {
    setup({
      notechart: {
        autos: [],
        notes: [{ time: 1, keysound: '0x' }],
      },
      options: {
        autosound: true,
      },
    })
    const playNoteMock = vi.spyOn(waveFactory, 'playNote')

    audio.update(1)
    expect(playNoteMock.mock.calls[0][0]['keysound']).toStrictEqual('0x')
  })

  it('should not play notes automatically when autosound is off', function () {
    setup({
      notechart: {
        autos: [],
        notes: [{ time: 1, keysound: '0x' }],
      },
      options: {},
    })
    const playNoteMock = vi.spyOn(waveFactory, 'playNote')

    audio.update(1)
    expect(playNoteMock).not.toHaveBeenCalled()
  })

  it('should play notes ahead of time', function () {
    setup({
      notechart: {
        autos: [{ time: 1, keysound: '0x' }],
        notes: [],
      },
      options: {},
    })
    const playAutoMock = vi.spyOn(waveFactory, 'playAuto')

    audio.update(0.999)
    expect(playAutoMock.mock.calls[0][0]['keysound']).toStrictEqual('0x')
    expect(playAutoMock.mock.calls[0][1]).to.be.closeTo(0.001, 1e-5)
  })

  it('should play hit notes', function () {
    setup(playerWithBMS())
    const playNoteMock = vi.spyOn(waveFactory, 'playNote')

    audio.update(0.999, {
      notifications: {
        sounds: [{ note: { keysound: '0x' }, type: 'hit', judgment: 1 }],
      },
      stats: {},
    })
    expect(playNoteMock.mock.calls[0][0]['keysound']).toStrictEqual('0x')
  })

  it('badly hit note should sound off-pitch', function () {
    setup(playerWithBMS())
    const instance = {
      bad: vi.fn(),
    }
    vi.spyOn(waveFactory, 'playNote').mockReturnValue(instance)

    audio.update(0.999, {
      notifications: {
        sounds: [{ note: { keysound: '0x' }, type: 'hit', judgment: 4 }],
      },
      stats: {},
    })
    expect(instance.bad).toHaveBeenCalled()
  })

  it('should work even without audio', function () {
    setup(playerWithBMS())
    vi.spyOn(waveFactory, 'playNote').mockReturnValue(null)

    audio.update(0.999, {
      notifications: {
        sounds: [{ note: { keysound: '0x' }, type: 'hit', judgment: 4 }],
      },
      stats: {},
    })
  })

  it('should stop sound when broken', function () {
    setup(playerWithBMS())
    const note = { keysound: '0x' }
    const instance = { stop: vi.fn() }
    vi.spyOn(waveFactory, 'playNote').mockReturnValue(instance)

    audio.update(0.999, {
      notifications: {
        sounds: [{ note: note, type: 'hit' }],
      },
      stats: {},
    })
    audio.update(1.1, {
      notifications: {
        sounds: [{ note: note, type: 'break' }],
      },
      stats: {},
    })
    expect(instance.stop).toHaveBeenCalled()
  })

  it('should play sounds when hitting blank space', function () {
    setup(playerWithBMS())
    const playFreeMock = vi.spyOn(waveFactory, 'playFree')

    audio.update(0.999, {
      notifications: {
        sounds: [{ note: { keysound: '0x' }, type: 'free' }],
      },
      stats: {},
    })
    expect(playFreeMock.mock.calls[0][0]['keysound']).toStrictEqual('0x')
  })

  it('should play hit note once', function () {
    setup(playerWithBMS())
    const playNoteMock = vi.spyOn(waveFactory, 'playNote')

    const note = { keysound: '0x' }
    audio.update(0.999, {
      notifications: {
        sounds: [{ note: note, type: 'hit' }],
      },
      stats: {},
    })
    audio.update(1.0, {
      notifications: {
        sounds: [{ note: note, type: 'hit' }],
      },
      stats: {},
    })
    expect(playNoteMock).toHaveBeenCalledOnce()
  })
})
