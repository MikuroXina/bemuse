import './AuthenticationPopup.scss'

import ModalPopup from '@bemuse/ui/ModalPopup.js'
import type { ComponentPropsWithRef } from 'react'

import AuthenticationPanel from './AuthenticationPanel.js'

export interface AuthenticationPopupProps
  extends ComponentPropsWithRef<typeof ModalPopup> {
  onFinish?: () => void
}

const AuthenticationPopup = (props: AuthenticationPopupProps) => (
  <ModalPopup {...props}>
    <div className='AuthenticationPopup'>
      <AuthenticationPanel onFinish={props.onFinish} />
    </div>
  </ModalPopup>
)

export default AuthenticationPopup
