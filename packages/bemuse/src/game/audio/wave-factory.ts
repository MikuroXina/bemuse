import type SamplingMaster from '@bemuse/sampling-master'
import type { PlayInstance, Sample, SoundGroup } from '@bemuse/sampling-master'
import type { SoundedEvent } from '@mikuroxina/bemuse-notechart'

export class WaveFactory {
  private _exclusiveInstances: Map<string, PlayInstance>
  private _group: SoundGroup

  constructor(
    private readonly master: SamplingMaster,
    private readonly samples: Record<string, Sample>,
    private readonly map: Record<string, string>,
    { volume }: { volume?: number } = {}
  ) {
    this._exclusiveInstances = new Map()
    this._group = this.master.group({ volume })
  }

  // Plays an autokeysound note (using limited polyphony)
  playAuto(note: SoundedEvent, delay: number): PlayInstance | null {
    return this._play({ note, delay, exclusive: true })
  }

  // Plays a hit note (using limited polyphony)
  // Returns the SoundInstance which may be stopped when hold note is missed
  playNote(note: SoundedEvent, delay: number): PlayInstance | null {
    return this._play({ note, delay, exclusive: true })
  }

  // Plays a note when hitting in the blank area (unlimited polyphony)
  playFree(note: SoundedEvent): PlayInstance | null {
    return this._play({ note, delay: 0, exclusive: false })
  }

  // Plays a note
  _play({
    note,
    delay,
    exclusive,
  }: {
    note: SoundedEvent
    delay: number
    exclusive?: boolean
  }) {
    const keysound = note.keysound
    if (exclusive) this._stopOldExclusiveSound(keysound, delay)
    const filename = this.map[keysound.toLowerCase()]
    if (!filename) return null
    const sample = this.samples[filename]
    if (!sample) return null
    const instance = sample.play(delay, {
      start: note.keysoundStart,
      end: note.keysoundEnd,
      group: this._group,
    })
    if (exclusive) this._exclusiveInstances.set(keysound, instance)
    return instance
  }

  _stopOldExclusiveSound(keysound: string, delay: number) {
    const instance = this._exclusiveInstances.get(keysound)
    if (instance) {
      setTimeout(() => instance.stop(), delay * 1000)
      this._exclusiveInstances.delete(keysound)
    }
  }
}

export default WaveFactory
