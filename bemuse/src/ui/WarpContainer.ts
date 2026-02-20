import './ModalPopup.scss'

import WARP from '@bemuse/utils/warp-element.js'
import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const WarpContainer = ({ children }: { children: ReactNode }) => {
  const [el] = useState(() => document.createElement('div'))

  useEffect(() => {
    WARP.appendChild(el)
    return () => {
      WARP.removeChild(el)
    }
  }, [])

  return createPortal(children, el)
}
export default WarpContainer
