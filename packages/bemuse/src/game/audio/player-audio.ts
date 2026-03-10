import type {
  PlayInstance,
  Sample,
  SamplingMaster,
} from '@bemuse/sampling-master'
import type { SoundedEvent } from '@mikuroxina/bemuse-notechart'
import sortBy from 'lodash/sortBy'

import { isBad, Judgment } from '../judgments'
import type Player from '../player'
import type PlayerState from '../state/player-state'
import type { SoundNotification } from '../state/player-state'
import WaveFactory from './wave-factory'

interface AutoPlayer {
  next(time: number): SoundedEvent[]
}

function autoPlayer(array: SoundedEvent[]): AutoPlayer {
  array = sortBy(array, 'time')
  let i = 0
  return {
    next(time) {
      const out = []
      for (; i < array.length && time >= array[i].time; i++) {
        out.push(array[i])
      }
      return out
    },
  }
}

export interface PlayerAudioOptions {
  player: Player
  samples: Record<string, Sample>
  master: SamplingMaster
  waveFactory?: WaveFactory
  volume?: number
}

export class PlayerAudio {
  private readonly _waveFactory: WaveFactory
  private readonly _autos: AutoPlayer
  private readonly _notes: AutoPlayer
  private readonly _played = new Map<SoundedEvent, PlayInstance>()
  private _autoSound: boolean

  constructor({
    player,
    samples,
    master,
    waveFactory,
    volume,
  }: PlayerAudioOptions) {
    const notechart = player.notechart
    this._waveFactory =
      waveFactory ??
      new WaveFactory(master, samples, notechart.keysounds, { volume })
    this._autos = autoPlayer(notechart.autos)
    this._notes = autoPlayer(notechart.notes)
    this._autoSound = !!player.options.autosound
  }

  update(time: number, state?: PlayerState) {
    this._playAutoKeysounds(time)
    this._playAutoSounds(time, state)
    this._handleSoundNotifications((state && state.notifications.sounds) || [])
  }

  _playAutoKeysounds(time: number) {
    for (const auto of this._autos.next(time + 1 / 30)) {
      this._waveFactory.playAuto(auto, auto.time - time)
    }
  }

  _playAutoSounds(time: number, state?: PlayerState) {
    const autosounds = this._notes.next(time + 1 / 30)
    const poor = state && state.stats.poor
    const shouldPlay = this._autoSound && !poor
    if (!shouldPlay) return
    for (const note of autosounds) {
      this._hitNote(note, note.time - time)
    }
  }

  _handleSoundNotifications(soundNotifications: readonly SoundNotification[]) {
    for (const notification of soundNotifications) {
      const { type, note } = notification
      if (type === 'hit') {
        this._hitNote(note, 0, notification.judgment)
      } else if (type === 'break') {
        this._breakNote(note)
      } else if (type === 'free') {
        this._waveFactory.playFree(note)
      }
    }
  }

  _hitNote(note: SoundedEvent, delay: number, judgment?: Judgment) {
    let instance = this._played.get(note) ?? null
    if (!instance) {
      instance = this._waveFactory.playNote(note, delay)
      if (instance) {
        this._played.set(note, instance)
      }
    }
    if (instance) {
      if (judgment != null && isBad(judgment)) {
        instance.bad()
      }
    }
  }

  _breakNote(note: SoundedEvent) {
    const instance = this._played.get(note)
    if (instance) {
      instance.stop()
    }
  }
}

export default PlayerAudio
