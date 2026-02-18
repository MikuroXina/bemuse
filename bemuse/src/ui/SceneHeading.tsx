import './SceneHeading.scss'

import c from 'classnames'
import React from 'react'

export interface SceneHeadingProps {
  className?: string
  children?: ReactNode
}

const SceneHeading = ({ className, children }: SceneHeadingProps) => (
  <div className={c('SceneHeading', className)}>{children}</div>
)

export default SceneHeading
