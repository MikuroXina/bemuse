import './OptionsButton.scss'

import type { MouseEvent, ReactNode } from 'react'

const OptionsButton = ({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
}) => (
  <button className='OptionsButton' onClick={onClick}>
    {children}
  </button>
)

export default OptionsButton
