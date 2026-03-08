import type { ReactNode } from 'react'

import styles from './Panel.module.scss'

export interface PanelProps {
  className?: string
  title: ReactNode
  children?: ReactNode
}

const Panel = ({ className, title, children }: PanelProps) => (
  <div className={`${styles.container} ${className}`}>
    <div className={styles.title}>{title}</div>
    <div>{children}</div>
  </div>
)

export default Panel
