import styles from './status-cell.module.css'

export type CellStatus = 'Information' | 'Success' | 'Error' | 'None'

export interface StatusCellProps {
  text: string
  status: CellStatus
}

export const StatusCell = ({ status, text }: StatusCellProps) => (
  <span data-status={status} className={styles.text}>
    {text}
  </span>
)
