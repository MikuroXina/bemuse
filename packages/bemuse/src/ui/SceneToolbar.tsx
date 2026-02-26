import type { ReactNode } from 'react'

import styles from './SceneToolbar.module.scss'

export const SceneToolbar = ({ children }: { children?: ReactNode }) => (
  <div className={styles.container}>{children}</div>
)

export const SceneToolbarSpacer = () => <div className={styles.spacer} />

export default SceneToolbar
