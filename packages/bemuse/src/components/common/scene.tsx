import {
  type DragEvent,
  type ForwardedRef,
  forwardRef,
  type ReactNode,
} from 'react'

import styles from './scene.module.scss'

export interface SceneProps {
  className: string
  children: ReactNode
  onDragEnter?: (e: DragEvent<HTMLDivElement>) => void
}

const Scene = (
  { className, children, onDragEnter }: SceneProps,
  ref: ForwardedRef<HTMLDivElement>
) => (
  <div
    ref={ref}
    className={`${styles.scene} ${className}`}
    onDragEnter={onDragEnter}
  >
    {children}
  </div>
)

export default forwardRef(Scene)
