import type SamplingMaster from '@bemuse/sampling-master/index.js'
import type { Sample } from '@bemuse/sampling-master/index.js'
import type { SoundedEvent } from '@mikuroxina/bemuse-notechart'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import WaveFactory from './wave-factory.js'

function k(id: string): SoundedEvent {
  return { keysound: id } as SoundedEvent
}

describe('WaveFactory', function () {
  const master = { group: vi.fn() }
  const sample = { play: vi.fn() }
  const samples = { 'wow.wav': sample as unknown as Sample }
  const map = { '0z': 'wow.wav' }
  let waveFactory: WaveFactory

  beforeEach(function () {
    vi.resetAllMocks()
    waveFactory = new WaveFactory(
      master as unknown as SamplingMaster,
      samples,
      map
    )
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
      await new Promise((resolve) => setTimeout(resolve, 0))
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
