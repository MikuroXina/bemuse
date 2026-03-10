import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import SamplingMaster, { FADE_LENGTH, Sample } from './index.js'

describe('SamplingMaster', function () {
  let context: AudioContext
  let master: SamplingMaster
  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers()

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
      expect(group.destination!.gain.value).to.equal(0.5)
    })
    it('connect upon construct, disconnect upon destroy', function () {
      let spyConnect: Mock<GainNode['connect']>
      let spyDisconnect: Mock<GainNode['disconnect']>
      vi.spyOn(master.audioContext, 'createGain').mockImplementation(function (
        this: AudioContext
      ) {
        const created = this.createGain()
        spyConnect = vi.spyOn(created, 'connect')
        spyDisconnect = vi.spyOn(created, 'disconnect')
        return created
      })

      const group = master.group()

      expect(spyConnect!).toHaveBeenCalledWith(master.destination)

      group.destroy()

      expect(spyDisconnect!).toHaveBeenCalledOnce()
      expect(group.destination).toBe(null)
    })
  })

  describe('#decode', function () {
    it('returns an audio buffer', async () => {
      const audioBuffer = await master.decode(new Blob([]))
      expect(audioBuffer.numberOfChannels).to.be.greaterThan(0)
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
      vi.spyOn(master.audioContext, 'decodeAudioData').mockImplementation(
        (_buf, _onSuccess, onError) => {
          onError!(new DOMException())
          return Promise.reject(new Error())
        }
      )
      await expect(master.sample(new ArrayBuffer(0))).rejects.toThrow()
    })
    describe('#play', function () {
      let sample: Sample
      let bufferSource: AudioBufferSourceNode
      let buffer: AudioBuffer
      let createBufferSourceMock: Mock<AudioContext['createBufferSource']>
      let startMock: Mock<AudioBufferSourceNode['start']>

      beforeEach(async function () {
        vi.resetAllMocks()

        bufferSource = context.createBufferSource()
        buffer = context.createBuffer(1, 44100, 44100)
        bufferSource.buffer = buffer
        createBufferSourceMock = vi
          .spyOn(context, 'createBufferSource')
          .mockReturnValue(bufferSource)
        startMock = vi.spyOn(bufferSource, 'start')

        sample = await master.sample(new Blob([]))
      })
      it('should play a buffer source', function () {
        sample.play()
        expect(createBufferSourceMock).toHaveBeenCalled()
        expect(startMock).toHaveBeenCalledWith(0, 0)
      })
      it('should play a buffer source with delay', function () {
        vi.advanceTimersByTime(1 * 1000)
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
        let spyConnect: Mock<GainNode['connect']>
        vi.spyOn(master.audioContext, 'createGain').mockImplementation(
          function (this: AudioContext) {
            const created = this.createGain()
            spyConnect = vi.spyOn(created, 'connect')
            return created
          }
        )

        const group = master.group()
        sample.play(0, { group })
        expect(spyConnect!).toHaveBeenCalledWith(group.destination)
      })

      it('should call #stop when playing finished', function () {
        const instance = sample.play()
        const stopMock = vi.spyOn(instance, 'stop')

        vi.advanceTimersByTime(1.5 * 1000)

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
    let sample: Sample
    beforeEach(async function () {
      sample = await master.sample(new Blob([]))
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
})
