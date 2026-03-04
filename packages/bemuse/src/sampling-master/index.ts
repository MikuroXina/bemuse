import defaultAudioContext from '@bemuse/audio-context'
import readBlob from '@bemuse/utils/read-blob'

import { decodeOGG } from './ogg'

export const FADE_LENGTH = 0.001

const dummyAudioTag = document.createElement('audio')
// Checks whether an audio format is supported.
export function canPlay(type: string): boolean {
  // We have a Vorbis audio decoder!
  if (type === 'audio/ogg; codecs="vorbis"') return true
  return dummyAudioTag.canPlayType(type) === 'probably'
}

const needsVorbisDecoder = !dummyAudioTag.canPlayType(
  'audio/ogg; codecs="vorbis"'
)

// The sampling master is a wrapper class around Web Audio API
// that takes care of:
//
// - Decoding audio from an ArrayBuffer or Blob (resulting in a "Sample").
// - Playing the `Sample` and managing its lifecycle.
export class SamplingMaster {
  private _samples: Sample[] = []
  private readonly _groups: SoundGroup[] = []
  private readonly _instances = new Set<PlayInstance>()
  private readonly _destination: AudioDestinationNode
  private _destroyed = false

  constructor(
    private readonly _audioContext: AudioContext = defaultAudioContext
  ) {
    this._destination = this._audioContext.destination
  }

  // Connects a dummy node to the audio, thereby unmuting the audio system on
  // iOS devices (which keeps the audio muted until a user interacts with the
  // page).
  unmute() {
    unmuteAudio(this._audioContext)
  }

  // The underlying AudioContext.
  get audioContext() {
    return this._audioContext
  }

  // The audio destination.
  get destination() {
    return this._destination
  }

  // The current time
  // See: https://webaudio.github.io/web-audio-api/#dom-baseaudiocontext-currenttime
  get currentTime() {
    return this._audioContext.currentTime
  }

  // Destroys this SamplingMaster, make it unusable.
  destroy() {
    if (this._destroyed) return
    this._destroyed = true
    for (const sample of this._samples) sample.destroy()
    for (const instance of this._instances) instance.destroy()
    this._samples = []
    this._instances.clear()
  }

  // Decodes the audio data from a Blob or an ArrayBuffer.
  // Returns an AudioBuffer which can be re-used in other sampling masters.
  async decode(blobOrArrayBuffer: Blob | ArrayBuffer): Promise<AudioBuffer> {
    const arrayBuffer = await this._coerceToArrayBuffer(blobOrArrayBuffer)
    return this._decodeAudio(arrayBuffer)
  }

  // Creates a `Sample` from a Blob or an ArrayBuffer or an AudioBuffer.
  async sample(
    blobOrArrayBufferOrAudioBuffer: Blob | ArrayBuffer | AudioBuffer
  ): Promise<Sample> {
    const audioBuffer =
      'numberOfChannels' in blobOrArrayBufferOrAudioBuffer
        ? blobOrArrayBufferOrAudioBuffer
        : await this.decode(blobOrArrayBufferOrAudioBuffer)
    if (this._destroyed) throw new Error('SamplingMaster already destroyed!')
    const sample = new Sample(this, audioBuffer)
    this._samples.push(sample)
    return sample
  }

  group(options: SoundGroupOptions): SoundGroup {
    const group = new SoundGroup(this, options)
    this._groups.push(group)
    return group
  }

  _coerceToArrayBuffer(
    blobOrArrayBuffer: Blob | ArrayBuffer
  ): Promise<ArrayBuffer> {
    if (blobOrArrayBuffer instanceof ArrayBuffer) {
      return Promise.resolve(blobOrArrayBuffer)
    } else {
      return readBlob(blobOrArrayBuffer).as('arraybuffer')
    }
  }

  _decodeAudio(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      if (needsVorbisDecoder && arrayBuffer.byteLength > 4) {
        const view = new Uint8Array(arrayBuffer, 0, 4)
        if (
          view[0] === 0x4f &&
          view[1] === 0x67 &&
          view[2] === 0x67 &&
          view[3] === 0x53
        ) {
          return resolve(decodeOGG(this.audioContext, arrayBuffer))
        }
      }
      this.audioContext.decodeAudioData(
        arrayBuffer,
        function decodeAudioDataSuccess(audioBuffer) {
          resolve(audioBuffer)
        },
        function decodeAudioDataFailure(e) {
          reject(new Error('Unable to decode audio: ' + e))
        }
      )
    })
  }

  _startPlaying(instance: PlayInstance) {
    this._instances.add(instance)
  }

  _stoppedPlaying(instance: PlayInstance) {
    this._instances.delete(instance)
  }
}

export interface SoundGroupOptions {
  volume?: number
}

// Sound group
export class SoundGroup {
  private _gain: GainNode | null

  constructor(
    private readonly _master: SamplingMaster,
    { volume }: SoundGroupOptions = {}
  ) {
    this._gain = this._master.audioContext.createGain()
    if (volume != null) this._gain.gain.value = volume
    this._gain.connect(this._master.destination)
  }

  get destination(): GainNode | null {
    return this._gain
  }

  destroy() {
    this._gain?.disconnect()
    this._gain = null
  }
}

// The Sample is created by and belongs to the `SamplingMaster`.
//
// You don't invoke this constructor directly; it is invoked by
// `SamplingMaster#create`.
export class Sample {
  private _master: SamplingMaster | null
  private _buffer: AudioBuffer | null
  constructor(samplingMaster: SamplingMaster, audioBuffer: AudioBuffer) {
    this._master = samplingMaster
    this._buffer = audioBuffer
  }

  // Plays the sample and returns the new PlayInstance.
  play(delay: number, options: PlayInstanceOptions = {}): PlayInstance {
    if (this._master == null || this._buffer == null) {
      throw new Error('Sample was destroyed')
    }
    return new PlayInstance(this._master, this._buffer, delay, options)
  }

  // Destroys this sample, thereby making it unusable.
  destroy() {
    this._master = null
    this._buffer = null
  }

  get duration(): number {
    return this._buffer?.duration ?? 0
  }
}

export interface PlayInstanceOptions {
  node?: AudioNode
  group?: SoundGroup
  start?: number
  end?: number
}

// When a `Sample` is played, a PlayInstance is created.
// A PlayInstance may not be reused; after the sound finishes playing,
// you have to invoke `Sample#play` again.
//
// You don't invoke this constructor directly; it is invoked by `Sample#play`.
export class PlayInstance {
  private _source: AudioBufferSourceNode | null
  private _gain: GainNode | null
  TEST_node: GainNode

  onstop: () => void = () => {}

  constructor(
    private readonly master: SamplingMaster,
    buffer: AudioBuffer,
    delay = 0,
    options: PlayInstanceOptions = {}
  ) {
    // Connect all the stuff...
    const context = master.audioContext
    const source = context.createBufferSource()
    source.buffer = buffer
    source.onended = () => this.stop()
    const gain = context.createGain()
    source.connect(gain)
    const destination =
      options.node ??
      (options.group && options.group.destination) ??
      master.destination
    gain.connect(destination)
    this._source = source
    this._gain = this.TEST_node = gain

    // Start the sound.
    const startTime = !delay ? 0 : Math.max(0, context.currentTime + delay)
    const startOffset = options.start ?? 0
    const fadeIn = startOffset > 0
    let fadeOutAt: undefined | number
    if (fadeIn) {
      gain.gain.setValueAtTime(0, 0)
    }
    if (options.end !== undefined) {
      const duration = Math.max(options.end - startOffset, 0)
      source.start(startTime, startOffset, duration + FADE_LENGTH)
      fadeOutAt = context.currentTime + delay + duration
    } else {
      source.start(startTime, startOffset)
    }
    if (fadeIn) {
      gain.gain.setValueAtTime(0, context.currentTime + delay)
      gain.gain.linearRampToValueAtTime(
        1,
        context.currentTime + delay + FADE_LENGTH
      )
    }
    if (fadeOutAt != null) {
      gain.gain.setValueAtTime(1, fadeOutAt)
      gain.gain.linearRampToValueAtTime(0, fadeOutAt + FADE_LENGTH)
    }
    this.master._startPlaying(this)
  }

  // Stops the sample and disconnects the underlying Web Audio nodes.
  stop() {
    if (!this._source) return
    this._source.stop(0)
    this._source.disconnect()
    this._gain?.disconnect()
    this._source = null
    this._gain = null
    this.master._stoppedPlaying(this)
    this.onstop()
  }

  // Makes this PlayInstance sound off-pitch, as a result of badly hitting
  // a note.
  bad() {
    if (!this._source) return
    this._source.playbackRate.value =
      Math.random() < 0.5 ? Math.pow(2, 1 / 24) : Math.pow(2, -1 / 24)
  }

  // Destroys this PlayInstance.
  destroy() {
    this.stop()
  }
}

export default SamplingMaster

/**
 * Enables Web Audio on iOS. By default, on iOS, audio is disabled.
 * This function must be called before audio will start working. It must be
 * called as a response to some user interaction (e.g. touchstart).
 *
 * Also, there’s now Chrome autoplay policy taking effect.
 * https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
 *
 * @param {AudioContext} ctx The AudioContext to be unmuted.
 */
export function unmuteAudio(ctx: AudioContext = defaultAudioContext): void {
  // Perform some strange magic to unmute the audio on iOS devices.
  // This code doesn’t make sense at all, you know.
  const gain = ctx.createGain()
  const osc = ctx.createOscillator()
  osc.frequency.value = 440
  osc.start(ctx.currentTime + 0.1)
  osc.stop(ctx.currentTime + 0.1)
  gain.connect(ctx.destination)
  gain.disconnect()

  resumeContext(ctx).catch((e) => {
    console.error('[sampling-master] Cannot resume AudioContext', e)
  })
}

async function resumeContext(ctx: AudioContext): Promise<void> {
  return await ctx.resume()
}
