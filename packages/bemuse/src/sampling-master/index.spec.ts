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

    vi.spyOn(context, 'decodeAudioData').mockImplementation(
      async () =>
        new AudioBuffer({
          numberOfChannels: 2,
          length: 1024,
          sampleRate: 3000,
        })
    )
  })

  it('unmutes the audio', function () {
    const gain = context.createGain()
    const createGainMock = vi.spyOn(context, 'createGain').mockReturnValue(gain)
    const connectMock = vi.spyOn(gain, 'connect')
    const disconnectMock = vi.spyOn(gain, 'disconnect')

    master.unmute()

    expect(createGainMock).toHaveBeenCalled()
    expect(connectMock).toHaveBeenCalled()
    expect(disconnectMock).toHaveBeenCalled()
  })

  it('group has a destination with gain', function () {
    const group = master.group({ volume: 0.5 })
    expect(group.destination!.gain.value).to.equal(0.5)
  })
  it('group connect upon construct, disconnect upon destroy', function () {
    let spyConnect: Mock<GainNode['connect']>
    let spyDisconnect: Mock<GainNode['disconnect']>
    const original = master.audioContext.createGain.bind(master.audioContext)
    vi.spyOn(master.audioContext, 'createGain').mockImplementation(() => {
      const created = original()
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

  it('decode returns an audio buffer', async () => {
    const audioBuffer = await master.decode(new Blob([]))
    expect(audioBuffer.numberOfChannels).to.be.greaterThan(0)
  })

  it('sample should coerce blob', function () {
    return master.sample(new Blob([]))
  })
  it('sample should coerce array buffer', function () {
    return master.sample(new ArrayBuffer(0))
  })
  it('sample should support an audiobuffer', function () {
    return master.decode(new Blob([])).then((audioBuffer) => {
      return master.sample(audioBuffer)
    })
  })
  it('sample should reject when decoding failed', async () => {
    vi.spyOn(master.audioContext, 'decodeAudioData').mockImplementation(() =>
      Promise.reject(new Error())
    )
    await expect(master.sample(new ArrayBuffer(0))).rejects.toThrow()
  })

  describe('#play', function () {
    let sample: Sample

    beforeEach(async function () {
      vi.restoreAllMocks()
      vi.useFakeTimers()

      const buf = new AudioBuffer({
        numberOfChannels: 2,
        length: 48000,
        sampleRate: 48000,
      })
      vi.spyOn(context, 'decodeAudioData').mockImplementation(async () => buf)

      sample = await master.sample(buf)
    })
    it('should play a buffer source', function () {
      let startMock: Mock<AudioBufferSourceNode['start']>
      const original = context.createBufferSource.bind(context)
      const spy = vi
        .spyOn(context, 'createBufferSource')
        .mockImplementation(() => {
          const bufferSourceNode = original()
          startMock = vi.spyOn(bufferSourceNode, 'start')
          return bufferSourceNode
        })

      sample.play()

      expect(spy).toHaveBeenCalled()
      expect(startMock!).toHaveBeenCalledWith(0, 0)
    })
    it('should play a buffer source with delay', function () {
      let startMock: Mock<AudioBufferSourceNode['start']>
      const original = context.createBufferSource.bind(context)
      const spy = vi
        .spyOn(context, 'createBufferSource')
        .mockImplementation(() => {
          const bufferSourceNode = original()
          startMock = vi.spyOn(bufferSourceNode, 'start')
          return bufferSourceNode
        })

      vi.advanceTimersByTime(1 * 1000)
      vi.spyOn(context, 'currentTime', 'get').mockReturnValue(1)
      sample.play(20)

      expect(spy).toHaveBeenCalled()
      expect(startMock!).toHaveBeenCalledWith(21, 0)
    })
    it('should play a buffer slice (without end)', function () {
      let startMock: Mock<AudioBufferSourceNode['start']>
      const original = context.createBufferSource.bind(context)
      vi.spyOn(context, 'createBufferSource').mockImplementation(() => {
        const bufferSourceNode = original()
        startMock = vi.spyOn(bufferSourceNode, 'start')
        return bufferSourceNode
      })

      sample.play(0, { start: 1, end: undefined })

      expect(startMock!).toHaveBeenCalledWith(0, 1)
    })
    it('should play a buffer slice (with end)', function () {
      let startMock: Mock<AudioBufferSourceNode['start']>
      const original = context.createBufferSource.bind(context)
      vi.spyOn(context, 'createBufferSource').mockImplementation(() => {
        const bufferSourceNode = original()
        startMock = vi.spyOn(bufferSourceNode, 'start')
        return bufferSourceNode
      })

      sample.play(0, { start: 1, end: 3 })
      expect(startMock!).toHaveBeenCalledWith(0, 1, 2 + FADE_LENGTH)
    })
    it('should play to a group', function () {
      let spyConnect: Mock<GainNode['connect']>
      const original = master.audioContext.createGain.bind(master.audioContext)
      vi.spyOn(master.audioContext, 'createGain').mockImplementation(() => {
        const created = original()
        spyConnect = vi.spyOn(created, 'connect')
        return created
      })

      const group = master.group()
      sample.play(0, { group })
      expect(spyConnect!).toHaveBeenCalledWith(group.destination)
    })

    it('should call #stop when playing finished', async () => {
      let stopMock: Mock<() => void>
      const original = context.createBufferSource.bind(context)
      vi.spyOn(context, 'createBufferSource').mockImplementation(() => {
        const bufferSourceNode = original()
        stopMock = vi.spyOn(bufferSourceNode, 'stop')
        return bufferSourceNode
      })

      sample.play()

      await vi.waitFor(
        () => {
          expect(stopMock!).toHaveBeenCalled()
        },
        { timeout: 1.5 * 1000 }
      )
    })

    describe('#stop', function () {
      it('should stop the buffer source', function () {
        let stopMock: Mock<AudioBufferSourceNode['stop']>
        const original = context.createBufferSource.bind(context)
        vi.spyOn(context, 'createBufferSource').mockImplementation(() => {
          const node = original()
          stopMock = vi.spyOn(node, 'stop')
          return node
        })

        const instance = sample.play()

        instance.stop()

        expect(stopMock!).toHaveBeenCalled()
      })
      it('can be called multiple times', function () {
        let stopMock: Mock<AudioBufferSourceNode['stop']>
        const original = context.createBufferSource.bind(context)
        vi.spyOn(context, 'createBufferSource').mockImplementation(() => {
          const node = original()
          stopMock = vi.spyOn(node, 'stop')
          return node
        })

        const instance = sample.play()

        instance.stop()
        instance.stop()
        instance.stop()

        expect(stopMock!).toHaveBeenCalledOnce()
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
        let bufferSourceNode: AudioBufferSourceNode
        const original = context.createBufferSource.bind(context)
        vi.spyOn(context, 'createBufferSource').mockImplementation(() => {
          return (bufferSourceNode = original())
        })

        const instance = sample.play()
        instance.bad()
        expect(bufferSourceNode!.playbackRate.value).not.to.equal(1)
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
