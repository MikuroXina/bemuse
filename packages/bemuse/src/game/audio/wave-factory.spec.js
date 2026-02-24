import delay from 'delay'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import WaveFactory from './wave-factory.js'

function k(id) {
  return { keysound: id }
}

describe('WaveFactory', function () {
  const master = { group: vi.fn() }
  const sample = { play: vi.fn() }
  const samples = { 'wow.wav': sample }
  const map = { '0z': 'wow.wav' }
  let waveFactory

  beforeEach(function () {
    vi.resetAllMocks()
    waveFactory = new WaveFactory(master, samples, map)
  })

  describe('playAuto', function () {
    it('should play an autokeysound', function () {
      waveFactory.playAuto(k('0z'), 0.1)
      expect(sample.play.mock.calls[0][0]).toStrictEqual(0.1)
    })
  })
  describe('playNote', function () {
    it('should play the keysound', function () {
      waveFactory.playNote(k('0z'), 0.1)
      expect(sample.play.mock.calls[0][0]).toStrictEqual(0.1)
    })
    it('should stop old sound', async () => {
      const instance = { stop: vi.fn() }
      sample.play.mockReturnValue(instance)
      waveFactory.playNote(k('0z'), 0)
      waveFactory.playNote(k('0z'), 0)
      await delay(0)
      expect(instance.stop).toHaveBeenCalledOnce()
    })
  })
  describe('playFree', function () {
    it('should play the keysound', function () {
      waveFactory.playFree(k('0z'))
      expect(sample.play).toHaveBeenCalled()
    })
  })
})
