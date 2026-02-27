import { timegate } from '@bemuse/game/judgments.js'
import Panel from '@bemuse/ui/Panel.js'
import range from 'lodash/range'
import mean from 'mean'
import median from 'median'
import type { ReactNode } from 'react'
import variance from 'variance'

import getNonMissedDeltas from '../../app/interactors/getNonMissedDeltas.js'
import styles from './ResultDeltasView.module.scss'

const ms = (delta: number) => `${(delta * 1000).toFixed(1)} ms`

const group = (deltas: readonly number[]) =>
  deltas
    .map((delta) => Math.floor(delta * 100))
    .reduce((prev: Record<number, number>, curr) => {
      prev[curr] = prev[curr] ? prev[curr] + 1 : 0
      return prev
    }, {})

const Row = ({
  text,
  data,
  options = {},
}: {
  text: string
  data: number
  options?: {
    showEarlyLate?: boolean
  }
}) => {
  let earlyLate: ReactNode
  if (options.showEarlyLate) {
    if (data > 0) {
      earlyLate = '(late)'
    } else if (data < 0) {
      earlyLate = '(early)'
    } else {
      earlyLate = ''
    }
  } else {
    earlyLate = null
  }
  return (
    <tr>
      <th>{text}</th>
      <td className='is-number'>{ms(data)}</td>
      <td>{earlyLate}</td>
    </tr>
  )
}

export interface ResultDeltasViewProps {
  deltas: readonly number[]
}

const ResultDeltasView = ({ deltas }: ResultDeltasViewProps) => {
  const nonMissDeltas = getNonMissedDeltas(deltas)
  const offDeltas = deltas.filter((delta) => timegate(1) <= Math.abs(delta))
  const earlyCount = offDeltas.filter((delta) => delta < 0).length
  const lateCount = offDeltas.filter((delta) => delta > 0).length
  const groups = group(deltas)
  const stats = range(-20, 20).map((bucket) => ({
    bucket,
    count: groups[bucket] || 0,
  }))
  const max = stats
    .map(({ count }) => count)
    .reduce((prev, curr) => Math.max(prev, curr), 0)
  const height = (value: number) => Math.ceil((value / Math.max(max, 1)) * 128)
  return (
    <div className={styles.container}>
      <Panel title='Accuracy Data'>
        <div className={styles.content}>
          <div className={styles.histogram}>
            {stats.map(({ bucket, count }) => (
              <div
                key={bucket}
                className={styles.histogramBar}
                data-bucket={bucket}
                style={{ height: height(count) }}
              />
            ))}
          </div>
          <div className={`${styles.number} is-early`}>
            <strong>{earlyCount}</strong> EARLY
          </div>
          <div className={`${styles.number} is-late`}>
            <strong>{lateCount}</strong> LATE
          </div>
          <table className={styles.info}>
            <tbody>
              <Row text='Mean:' data={mean(nonMissDeltas)} />
              <Row
                text='S.D:'
                data={Math.sqrt(variance(nonMissDeltas))}
                options={{ showEarlyLate: false }}
              />
              <Row text='Median:' data={median(nonMissDeltas)} />
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

export default ResultDeltasView
