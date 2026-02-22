import './MusicListItemCharts.scss'

import type { Chart } from 'bemuse-types'
import type { MouseEvent } from 'react'

import MusicListItemChart from './MusicListItemChart.js'

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
  <div className='MusicListItemCharts'>
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
