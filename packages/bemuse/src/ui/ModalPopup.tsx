import type { MouseEvent, ReactNode } from 'react'

import styles from './ModalPopup.module.scss'
import WarpContainer from './WarpContainer.js'

export interface ModalPopupProps {
  visible?: boolean
  onBackdropClick?: (e: MouseEvent<HTMLDivElement>) => void
  children?: ReactNode
}

const ModalPopup = ({
  visible,
  onBackdropClick,
  children,
}: ModalPopupProps) => {
  if (visible === false) return null
  return (
    <WarpContainer>
      <div className={styles.container} onClick={onBackdropClick}>
        <div className={styles.scroller}>
          <div className={styles.contentsContainer}>
            <div
              className={styles.contents}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </WarpContainer>
  )
}

export default ModalPopup
