import { getDeltasStats } from '@bemuse/app/interactors/stats'
import { memo } from 'react'

import styles from './result-expert-info.module.css'

function formatOffset(n: number) {
  let sign: string
  if (n === 0) {
    sign = ''
  } else if (n < 0) {
    sign = '-'
  } else {
    sign = '+'
  }
  return sign + formatDuration(Math.abs(n))
}

function formatDuration(n: number) {
  return (n * 1000).toFixed(1)
}

export interface ResultExpertInfoProps {
  deltas: readonly number[]
}

const ResultExpertInfo = ({ deltas }: ResultExpertInfoProps) => {
  const stats = getDeltasStats(deltas)
  return (
    <span>
      <span
        className={styles.helpLabel}
        title='Average and standard deviation of your keypresses.'
      >
        {formatOffset(stats.mean)}{' '}
        {Number.isNaN(stats.standardDeviation)
          ? ''
          : `± ${formatDuration(stats.standardDeviation)}`}
        ms
      </span>
    </span>
  )
}

export default memo(ResultExpertInfo)
