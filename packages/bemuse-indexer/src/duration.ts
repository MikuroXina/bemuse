import * as BMS from '@mikuroxina/bms'

export function getDuration(notes: BMS.Notes, timing: BMS.Timing) {
  const maxBeat = notes
    .all()
    .map(({ beat }) => beat)
    .reduce((prev, curr) => Math.max(prev, curr), 0)
  return timing.beatToSeconds(maxBeat)
}
