import AuthenticationPopup from '@bemuse/online/ui/AuthenticationPopup'
import { sceneRoot } from '@bemuse/utils/main-element'
import React from 'react'

const OnlineAuthenticationTestScene = () => (
  <div>
    <AuthenticationPopup />
  </div>
)

export function main() {
  sceneRoot.render(<OnlineAuthenticationTestScene />)
}
