import ModalPopup from '@bemuse/components/common/modal-popup.js'
import type { ComponentPropsWithRef } from 'react'

import AuthenticationPanel from './authentication-panel.js'

export interface AuthenticationPopupProps extends ComponentPropsWithRef<
  typeof ModalPopup
> {
  onFinish?: () => void
}

const AuthenticationPopup = (props: AuthenticationPopupProps) => (
  <ModalPopup {...props}>
    <AuthenticationPanel onFinish={props.onFinish} />
  </ModalPopup>
)

export default AuthenticationPopup
