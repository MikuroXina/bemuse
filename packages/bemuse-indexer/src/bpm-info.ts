import * as BMS from '@mikuroxina/bms'

export function getBpmInfo(notes: BMS.Notes, timing: BMS.Timing) {
  const maxBeat = notes
    .all()
    .map(({ beat }) => beat)
    .reduce((prev, curr) => Math.max(prev, curr), 0)
  const beats = [
    ...new Set(
      timing
        .getEventBeats()
        .concat([0, maxBeat])
        .toSorted((a, b) => a - b)
    ).values(),
  ].filter((beat) => beat! <= maxBeat)
  const data: [number, number][] = []
  for (let i = 0; i + 1 < beats.length; i++) {
    const length =
      timing.beatToSeconds(beats[i + 1]) - timing.beatToSeconds(beats[i])
    const bpm = timing.bpmAtBeat(beats[i])
    data.push([bpm, length])
  }
  const getPercentile = percentile(data)
  return {
    init: timing.bpmAtBeat(0),
    min: getPercentile(2),
    median: getPercentile(50),
    max: getPercentile(98),
  }
}

function percentile(data: [number, number][]) {
  data = data.toSorted((a, b) => a[0] - b[0])
  const total = data.reduce((acc, curr) => acc + curr[1], 0)
  return (percentileNo: number) => {
    let current = 0
    for (let i = 0; i < data.length; i++) {
      current += data[i][1]
      if (current / total >= percentileNo / 100) return data[i][0]
    }
    return 0
  }
}
