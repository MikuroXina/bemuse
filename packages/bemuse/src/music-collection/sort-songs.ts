import type { Song } from '@bemuse/collection-model/types.js'
import orderBy from 'lodash/orderBy'

import isChartPlayable from './isChartPlayable.js'

export function sortSongs(songs: readonly Song[]) {
  return orderBy(songs, [
    (song) => {
      return song.charts
        .filter(isChartPlayable)
        .filter((chart) => chart.info.difficulty < 5)
        .filter((chart) => chart.info.level > 0)
        .map((chart) => chart.info.level)
        .reduce((prev, curr) => Math.min(prev, curr), Infinity)
    },
    (song) => song.bpm,
    (song) => song.title.toLowerCase(),
  ])
}

export default sortSongs
