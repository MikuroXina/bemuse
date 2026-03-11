import type { ReactNode } from 'react'

import styles from './scene-heading.module.scss'

export interface SceneHeadingProps {
  className?: string
  children?: ReactNode
}

const SceneHeading = ({ className, children }: SceneHeadingProps) => (
  <div className={`${styles.heading} ${className}`}>{children}</div>
)

export default SceneHeading
