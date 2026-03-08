import './OptionsButton.scss'

import type { MouseEvent, ReactNode } from 'react'

const OptionsButton = ({
  className = '',
  children,
  onClick,
}: {
  className?: string
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
}) => (
  <button className={`OptionsButton ${className}`} onClick={onClick}>
    {children}
  </button>
)

export default OptionsButton
