import AuthenticationPopup from '@bemuse/online/ui/AuthenticationPopup.js'
import { sceneRoot } from '@bemuse/utils/main-element.js'

const OnlineAuthenticationTestScene = () => (
  <div>
    <AuthenticationPopup />
  </div>
)

export function main() {
  sceneRoot.render(<OnlineAuthenticationTestScene />)
}
