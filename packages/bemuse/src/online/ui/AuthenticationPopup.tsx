import ModalPopup from '@bemuse/ui/ModalPopup.js'
import type { ComponentPropsWithRef } from 'react'

import AuthenticationPanel from './AuthenticationPanel.js'

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
