import * as BMS from 'bms'
import _ from 'lodash'

export function getDuration(notes: BMS.Notes, timing: BMS.Timing) {
  const maxBeat = _(notes.all()).map('beat').max() || 0
  return timing.beatToSeconds(maxBeat)
}
