import type { MouseEvent, ReactNode } from 'react'

import styles from './options-button.module.scss'

const OptionsButton = ({
  className = '',
  children,
  onClick,
}: {
  className?: string
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
}) => (
  <button className={`${styles.button} ${className}`} onClick={onClick}>
    {children}
  </button>
)

export default OptionsButton
