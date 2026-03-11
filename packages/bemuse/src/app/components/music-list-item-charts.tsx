import type { Chart } from '@mikuroxina/bemuse-types'
import type { MouseEvent } from 'react'

import MusicListItemChart from './music-list-item-chart.js'
import styles from './music-list-item-charts.module.scss'

export interface MusicListItemChartsProps {
  charts: readonly Chart[]
  onChartClick: (chart: Chart, e: MouseEvent<HTMLDivElement>) => void
  selectedChart?: Chart
}

const MusicListItemCharts = ({
  charts,
  onChartClick,
  selectedChart,
}: MusicListItemChartsProps) => (
  <div className={styles.charts}>
    {charts.map((chart, index) => (
      <MusicListItemChart
        key={index}
        chart={chart}
        selected={!!selectedChart && chart.md5 === selectedChart.md5}
        onClick={onChartClick}
      />
    ))}
  </div>
)

export default MusicListItemCharts
