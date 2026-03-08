import './MusicListItemChart.scss'

import { getGrade } from '@bemuse/rules/grade.js'
import type { Chart } from '@mikuroxina/bemuse-types'
import type { MouseEvent } from 'react'

import { usePersonalRecord } from './usePersonalRecord.js'

export interface MusicListItemChartProps {
  chart: Chart
  selected: boolean
  onClick: (chart: Chart, e: MouseEvent<HTMLDivElement>) => void
}

const MusicListItemChart = ({
  chart,
  selected,
  onClick,
}: MusicListItemChartProps) => {
  const [isLoading, record] = usePersonalRecord(chart)
  const played = !!record
  let grade = played ? getGrade(record) : null
  if (grade === 'F') grade = null

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick(chart, e)
    }
  }

  return (
    <div
      className='MusicListItemChart'
      onClick={handleClick}
      data-md5={chart.md5}
      data-played={played}
      data-selected={selected}
      data-grade={!!grade}
    >
      <span>{isLoading ? '…' : grade || chart.info.level}</span>
    </div>
  )
}

export default MusicListItemChart
