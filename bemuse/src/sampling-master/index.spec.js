/* global WebAudioTestAPI */

import 'web-audio-test-api'

import assert from 'assert'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import SamplingMaster, { FADE_LENGTH } from './index.js'

describe('SamplingMaster', function () {
  let context
  let master
  beforeAll(() => {
    WebAudioTestAPI.use()
  })
  beforeEach(() => {
    vi.resetAllMocks()

    context = new AudioContext()
    master = new SamplingMaster(context)
  })

  describe('#unmute', function () {
    it('unmutes the audio', function () {
      const gain = context.createGain()
      const createGainMock = vi
        .spyOn(context, 'createGain')
        .mockReturnValue(gain)
      const connectMock = vi.spyOn(gain, 'connect')
      const disconnectMock = vi.spyOn(gain, 'disconnect')

      master.unmute()

      expect(createGainMock).toHaveBeenCalled()
      expect(connectMock).toHaveBeenCalled()
      expect(disconnectMock).toHaveBeenCalled()
    })
  })

  describe('#group', function () {
    it('has a destination with gain', function () {
      const group = master.group({ volume: 0.5 })
      expect(group.destination.gain.value).to.equal(0.5)
    })
    it('connect upon construct, disconnect upon destroy', function () {
      const group = master.group()
      const node = group.destination
      expect(node.$isConnectedTo(master.destination)).toBe(true)
      group.destroy()
      expect(node.$isConnectedTo(master.destination)).toBe(false)
      expect(group.destination).toBe(null)
    })
  })

  describe('#decode', function () {
    it('returns an audio buffer', () => {
      return master.decode(new Blob([])).then((audioBuffer) => {
        assert(audioBuffer.numberOfChannels)
      })
    })
  })

  describe('#sample', function () {
    it('should coerce blob', function () {
      return master.sample(new Blob([]))
    })
    it('should coerce array buffer', function () {
      return master.sample(new ArrayBuffer(0))
    })
    it('should support an audiobuffer', function () {
      return master.decode(new Blob([])).then((audioBuffer) => {
        return master.sample(audioBuffer)
      })
    })
    it('should reject when decoding failed', async () => {
      context.DECODE_AUDIO_DATA_FAILED = true
      await expect(master.sample(new ArrayBuffer(0))).rejects.toThrow()
      context.DECODE_AUDIO_DATA_FAILED = false
    })
    describe('#play', function () {
      let sample
      let bufferSource
      let buffer
      let createBufferSourceMock
      let startMock

      beforeEach(function () {
        vi.resetAllMocks()

        bufferSource = context.createBufferSource()
        buffer = context.createBuffer(1, 44100, 44100)
        bufferSource.buffer = buffer
        createBufferSourceMock = vi
          .spyOn(context, 'createBufferSource')
          .mockReturnValue(bufferSource)
        startMock = vi.spyOn(bufferSource, 'start')

        return master.sample(new Blob([])).then((s) => (sample = s))
      })
      it('should play a buffer source', function () {
        sample.play()
        expect(createBufferSourceMock).toHaveBeenCalled()
        expect(startMock).toHaveBeenCalledWith(0, 0)
      })
      it('should play a buffer source with delay', function () {
        context.$processTo(1)
        sample.play(20)
        expect(createBufferSourceMock).toHaveBeenCalled()
        expect(startMock).toHaveBeenCalledWith(21, 0)
      })
      it('should play a buffer slice (without end)', function () {
        sample.play(0, { start: 1, end: undefined })
        expect(startMock).toHaveBeenCalledWith(0, 1)
      })
      it('should play a buffer slice (with end)', function () {
        sample.play(0, { start: 1, end: 3 })
        expect(startMock).toHaveBeenCalledWith(0, 1, 2 + FADE_LENGTH)
      })
      it('should play to a group', function () {
        const group = master.group()
        const instance = sample.play(0, { group })
        expect(instance.TEST_node.$isConnectedTo(group.destination)).toBe(true)
      })

      it('should call #stop when playing finished', function () {
        const instance = sample.play()
        const stopMock = vi.spyOn(instance, 'stop')

        context.$processTo(1.5)

        expect(stopMock).toHaveBeenCalled()
      })

      describe('#stop', function () {
        it('should stop the buffer source', function () {
          const instance = sample.play()
          const stopMock = vi.spyOn(bufferSource, 'stop')

          instance.stop()

          expect(stopMock).toHaveBeenCalled()
        })
        it('can be called multiple times', function () {
          const instance = sample.play()
          const stopMock = vi.spyOn(bufferSource, 'stop')

          instance.stop()
          instance.stop()
          instance.stop()

          expect(stopMock).toHaveBeenCalledOnce()
        })
        it('should call #onstop', function () {
          const instance = sample.play()
          instance.onstop = vi.fn()

          instance.stop()

          expect(instance.onstop).toHaveBeenCalled()
        })
      })

      describe('#bad', function () {
        it('should change pitch of sound', function () {
          const instance = sample.play()
          instance.bad()
          expect(bufferSource.playbackRate.value).not.to.equal(1)
        })
      })
    })
  })

  describe('#destroy', function () {
    let sample
    beforeEach(function () {
      return master.sample(new Blob([])).then((s) => (sample = s))
    })
    it('should stop all samples', function () {
      const a = sample.play()
      const b = sample.play()
      const c = sample.play()
      const aStopMock = vi.spyOn(a, 'stop')
      const bStopMock = vi.spyOn(b, 'stop')
      const cStopMock = vi.spyOn(c, 'stop')

      master.destroy()

      expect(aStopMock).toHaveBeenCalled()
      expect(bStopMock).toHaveBeenCalled()
      expect(cStopMock).toHaveBeenCalled()
    })
    it('can no longer create samples', async () => {
      master.destroy()
      await expect(master.sample(new Blob([]))).rejects.toThrow()
    })
    it('only destroys once', function () {
      const a = sample.play()
      const destroyMock = vi.spyOn(a, 'destroy')

      master.destroy()
      master.destroy()

      expect(destroyMock).toHaveBeenCalledOnce()
    })
  })

  afterAll(() => {
    WebAudioTestAPI.unuse()
  })
})
