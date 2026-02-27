import type { Chart } from '@mikuroxina/bemuse-types'
import orderBy from 'lodash/orderBy'

import isChartPlayable from './isChartPlayable.js'

export function getPlayableCharts(charts: readonly Chart[]): Chart[] {
  return orderBy(charts.filter(isChartPlayable), [
    (chart) => (chart.info.difficulty >= 5 ? 1 : 0),
    (chart) => chart.keys,
    (chart) => chart.info.level,
  ])
}

export default getPlayableCharts
