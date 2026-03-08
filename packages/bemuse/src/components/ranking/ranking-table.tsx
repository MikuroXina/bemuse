import {
  formattedAccuracyForRecord,
  type ScoreCount,
} from '@bemuse/rules/accuracy.js'
import type { ReactNode } from 'react'

import styles from './RankingTable.module.scss'

const RankingTable = ({ children }: { children: ReactNode }) => (
  <table className={styles.container}>
    <tbody>{children}</tbody>
  </table>
)

export interface RowProps {
  record: {
    rank?: number
    playerName: string
    score: number
    count: ScoreCount
    total: number
  }
}

export const Row = ({ record }: RowProps) => (
  <tr>
    <td className={styles.rank}>
      {record.rank || <span title='Unable to determine your rank'>??</span>}
    </td>
    <td className={styles.name}>{record.playerName}</td>
    <td className={styles.score}>{record.score}</td>
    <td className={styles.accuracy}>{formattedAccuracyForRecord(record)}</td>
  </tr>
)

export const Message = ({ children }: { children: ReactNode }) => (
  <tr>
    <td colSpan={4} className={styles.message}>
      {children}
    </td>
  </tr>
)

export default RankingTable
