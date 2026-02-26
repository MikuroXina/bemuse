import { Icon } from '@bemuse/fa/index.js'
import { useCurrentUser } from '@bemuse/online/hooks.js'
import { formattedAccuracyForRecord } from '@bemuse/rules/accuracy.js'
import type { ReactNode } from 'react'

import formatTime from '../../utils/formatTime.js'
import styles from './MusicInfoTabStats.module.scss'
import { usePersonalRecord } from './usePersonalRecord.js'

export interface PartialChart {
  md5: string
  noteCount: number
  bpm: { median: number }
  duration: number
}

export interface MusicInfoTabStatsProps {
  chart: PartialChart
}

const WhenNotLoading = ({
  loading,
  children,
}: {
  loading: boolean
  children: ReactNode
}) => (loading ? <Icon name='spinner' spin /> : <>{children}</>)

const Message = ({ show }: { show: boolean }) =>
  show ? (
    <div className={styles.message}>
      Please log in or create an account to save your play statistics.
    </div>
  ) : null

const MusicInfoTabStats = ({ chart }: MusicInfoTabStatsProps) => {
  const user = useCurrentUser()
  const [loading, record] = usePersonalRecord(chart)
  return (
    <div className={styles.tabStats}>
      <Message show={!user} />
      <dl className={`${styles.column} ${styles.left}`}>
        <dt>Notes</dt>
        <dd>{chart.noteCount}</dd>
        <dt>BPM</dt>
        <dd>{chart.bpm.median}</dd>
        <dt>Duration</dt>
        <dd>{formatTime(chart.duration)}</dd>
        <dt>Play Count</dt>
        <dd data-testid='stats-play-count'>
          <WhenNotLoading loading={loading}>
            {record ? record.playCount : user ? '0' : '-'}
          </WhenNotLoading>
        </dd>
      </dl>
      <dl className={`${styles.column} ${styles.right}`}>
        <dt>Best Score</dt>
        <dd data-testid='stats-best-score'>
          <WhenNotLoading loading={loading}>
            {record ? record.score : '-'}
          </WhenNotLoading>
        </dd>

        <dt>Accuracy</dt>
        <dd>
          <WhenNotLoading loading={loading}>
            {record ? formattedAccuracyForRecord(record) : '-'}
          </WhenNotLoading>
        </dd>

        <dt>Max Combo</dt>
        <dd>
          <WhenNotLoading loading={loading}>
            {record ? (
              <span>
                {record.combo} <small>/ {record.total}</small>
              </span>
            ) : (
              <>-</>
            )}
          </WhenNotLoading>
        </dd>
      </dl>
    </div>
  )
}

export default MusicInfoTabStats
