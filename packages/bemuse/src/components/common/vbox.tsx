import type { ReactNode } from 'react'

import styles from './vbox.module.css'

export interface VBoxProps {
  children?: ReactNode
}

const VBox = ({ children }: VBoxProps) => (
  <div className={styles.container}>{children}</div>
)

export default VBox
