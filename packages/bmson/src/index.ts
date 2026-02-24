import * as BMS from '@mikuroxina/bms'
import _ from 'lodash'

import * as legacy from './legacy.js'
import type { Bmson } from './types.js'
import * as utils from './utils.js'
export * from './types.js'

export interface PartialBmson {
  info: Partial<Bmson['info']>
  version?: string
}

/**
 * Returns a BMS.SongInfo corresponding to this BMS file.
 */
export function songInfoForBmson(bmson: PartialBmson): BMS.SongInfo {
  const bmsonInfo = bmson.info
  const info: Partial<BMS.ISongInfoData> = {}
  if (bmsonInfo.title) info.title = bmsonInfo.title
  if (bmsonInfo.artist) info.artist = bmsonInfo.artist
  if (bmsonInfo.genre) info.genre = bmsonInfo.genre
  if (bmsonInfo.level) info.level = bmsonInfo.level
  info.subtitles = getSubtitles()
  if (bmsonInfo.subartists) info.subartists = bmsonInfo.subartists
  return new BMS.SongInfo(info)

  function getSubtitles() {
    if (!bmson.version) return ['Warning: legacy bmson']
    const subtitles = []
    if (bmsonInfo.chart_name && typeof bmsonInfo.chart_name === 'string') {
      subtitles.push(bmsonInfo.chart_name)
    }
    if (bmsonInfo.subtitle && typeof bmsonInfo.subtitle === 'string') {
      subtitles.push(...bmsonInfo.subtitle.split('\n'))
    }
    return subtitles
  }
}

/**
 * Returns the barlines as an array of beats.
 */
export function barLinesForBmson(bmson: Bmson | legacy.LegacyBmson) {
  if (!('version' in bmson)) return legacy.barLinesForBmson(bmson)
  const beatForPulse = beatForPulseForBmson(bmson)
  const lines = bmson.lines
  return _(lines)
    .map(({ y }) => beatForPulse(y))
    .sortBy()
    .value()
}

/**
 * Returns the information to be passed to BMS.Timing constructor
 * in order to generate the timing data represented by the `bmson` object.
 * @param {Bmson} bmson
 */
export function timingInfoForBmson(
  bmson: Bmson | legacy.LegacyBmson
): utils.TimingInfo {
  if (!('version' in bmson)) return legacy.timingInfoForBmson(bmson)
  const beatForPulse = beatForPulseForBmson(bmson)
  return {
    initialBPM: bmson.info.init_bpm,
    actions: [
      ...(bmson.bpm_events || []).map(
        ({ y, bpm }) =>
          ({
            type: 'bpm',
            beat: beatForPulse(y),
            bpm: bpm,
          }) as BMS.BPMTimingAction
      ),
      ...(bmson.stop_events || []).map(
        ({ y, duration }) =>
          ({
            type: 'stop',
            beat: beatForPulse(y),
            stopBeats: beatForPulse(Math.floor(duration)),
          }) as BMS.StopTimingAction
      ),
    ],
  }
}

/**
 * Returns the timing data represented by the `bmson` object.
 * @param {Bmson} bmson
 */
function timingForBmson(bmson: Bmson | legacy.LegacyBmson) {
  const { initialBPM, actions } = timingInfoForBmson(bmson)
  return new BMS.Timing(initialBPM, actions)
}

/**
 * Options for generating musical score
 */
export interface MusicalScoreOptions {
  /**
   * Double-play mode — in addition to channels 1-7 and SC, 8-14 and SC2 will be added.
   */
  double?: boolean
}

/**
 * Returns the musical score (comprised of BMS.Notes and BMS.Keysounds).
 * @param {Bmson} bmson
 */
export function musicalScoreForBmson(
  bmson: Bmson | legacy.LegacyBmson,
  options: MusicalScoreOptions = {}
) {
  const timing = timingForBmson(bmson)
  const { notes, keysounds } = notesDataAndKeysoundsDataForBmsonAndTiming(
    bmson,
    timing,
    options
  )
  return {
    /**
     * The {BMS.Timing} object for this musical score.
     */
    timing,
    /**
     * A {BMS.Notes} representing notes inside the bmson notechart.
     */
    notes: new BMS.Notes(notes),
    /**
     * A {BMS.Keysounds} representing mapping between keysound in the
     * `notes` field to the actual keysound file name.
     */
    keysounds: new BMS.Keysounds(keysounds),
  }
}

function soundChannelsForBmson(bmson: Bmson | legacy.LegacyBmson) {
  return 'version' in bmson ? bmson.sound_channels : bmson.soundChannel
}

function notesDataAndKeysoundsDataForBmsonAndTiming(
  bmson: Bmson | legacy.LegacyBmson,
  timing: BMS.Timing,
  options: MusicalScoreOptions
) {
  let nextKeysoundNumber = 1
  const beatForPulse = beatForPulseForBmson(bmson)
  const notes = []
  const keysounds: { [keysoundId: string]: string } = {}
  const soundChannels = soundChannelsForBmson(bmson)
  if (soundChannels) {
    for (const { name, notes: soundChannelNotes } of soundChannels) {
      const sortedNotes = _.sortBy(soundChannelNotes, 'y')
      const keysoundNumber = nextKeysoundNumber++
      const keysoundId = _.padStart('' + keysoundNumber, 4, '0')
      const slices = utils.slicesForNotesAndTiming(soundChannelNotes, timing, {
        beatForPulse: beatForPulse,
      })

      keysounds[keysoundId] = name

      for (const { x, y, l } of sortedNotes) {
        const note: BMS.BMSNote = {
          column: getColumn(x, options),
          beat: beatForPulse(y),
          keysound: keysoundId,
          endBeat: undefined,
        }
        if (l > 0) {
          note.endBeat = beatForPulse(y + l)
        }
        const slice = slices.get(y)
        if (slice) {
          Object.assign(note, slice)
          notes.push(note)
        }
      }
    }
  }
  return { notes, keysounds }
}

export { _slicesForNotesAndTiming } from './legacy.js'

export function beatForPulseForBmson(bmson: Bmson | legacy.LegacyBmson) {
  if (!('version' in bmson)) return legacy.beatForLoc
  const resolution = (bmson.info && bmson.info.resolution) || 240
  return (y: number) => y / resolution
}

function getColumn(x: unknown, options: MusicalScoreOptions) {
  switch (x) {
    case 1:
      return '1'
    case 2:
      return '2'
    case 3:
      return '3'
    case 4:
      return '4'
    case 5:
      return '5'
    case 6:
      return '6'
    case 7:
      return '7'
    case 8:
      return 'SC'
  }

  if (options.double) {
    switch (x) {
      case 9:
        return '8'
      case 10:
        return '9'
      case 11:
        return '10'
      case 12:
        return '11'
      case 13:
        return '12'
      case 14:
        return '13'
      case 15:
        return '14'
      case 16:
        return 'SC2'
    }
  }
  return undefined
}

/**
 * Checks if there is a scratch in a bmson file
 */
export function hasScratch(bmson: Bmson | legacy.LegacyBmson) {
  const soundChannels = soundChannelsForBmson(bmson)
  if (soundChannels) {
    for (const { notes } of soundChannels) {
      for (const { x } of notes) {
        if (x === 8 || x === 18) return true
      }
    }
  }
  return false
}

/**
 * Checks the key mode for a bmson file
 */
export function keysForBmson(bmson: Bmson | legacy.LegacyBmson) {
  const soundChannels = soundChannelsForBmson(bmson)
  let hasKeys = false
  let hasSecondPlayer = false
  let hasDeluxeKeys = false
  if (soundChannels) {
    for (const { notes } of soundChannels) {
      for (const { x } of notes) {
        hasKeys = true
        if (x >= 11 && x <= 20) hasSecondPlayer = true
        if (x === 6 || x === 7 || x === 16 || x === 17) hasDeluxeKeys = true
      }
    }
  }
  if (!hasKeys) return 'empty'
  if (hasSecondPlayer) {
    return hasDeluxeKeys ? '14K' : '10K'
  } else {
    return hasDeluxeKeys ? '7K' : '5K'
  }
}
