import type { Chart } from '@mikuroxina/bemuse-types'

export function isChartPlayable(chart: Chart): boolean {
  return chart.keys === '7K' || chart.keys === '5K'
}

export default isChartPlayable
