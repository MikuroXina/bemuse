import './Panel.scss'

import type { ReactNode } from 'react'

export interface PanelProps {
  className?: string
  title: ReactNode
  children?: ReactNode
}

const Panel = ({ className, title, children }: PanelProps) => (
  <div className={`Panel ${className}`}>
    <div className='Panelのtitle'>{title}</div>
    <div className='Panelのcontent'>{children}</div>
  </div>
)

export default Panel
