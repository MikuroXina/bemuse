import './AuthenticationPopup.scss'

import ModalPopup from '@bemuse/ui/ModalPopup'
import React, { ComponentPropsWithRef } from 'react'

import AuthenticationPanel from './AuthenticationPanel'

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
