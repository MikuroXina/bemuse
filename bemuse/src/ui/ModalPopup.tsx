import './ModalPopup.scss'

import type { MouseEvent, ReactNode } from 'react'

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
      <div className='ModalPopup' onClick={onBackdropClick}>
        <div className='ModalPopupのscroller'>
          <div className='ModalPopupのcontentsContainer'>
            <div
              className='ModalPopupのcontents'
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
