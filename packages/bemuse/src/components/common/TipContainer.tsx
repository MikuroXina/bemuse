import type { ReactNode } from 'react'

import styles from './TipContainer.module.scss'

const TipContainer = ({
  children,
  tip,
  tipVisible = true,
}: {
  children?: ReactNode
  tip?: ReactNode
  tipVisible?: boolean
}) => (
  <div className={styles.container}>
    <div>{children}</div>
    {tipVisible ? (
      <span className={styles.bubble}>
        <span className={styles.bubbleContent}>{tip}</span>
      </span>
    ) : null}
  </div>
)

export default TipContainer
