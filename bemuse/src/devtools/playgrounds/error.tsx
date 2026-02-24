import GenericErrorScene from '@bemuse/components/GenericErrorScene.js'
import { sceneRoot } from '@bemuse/utils/main-element.js'

const ErrorScene = () => (
  <div>
    <GenericErrorScene
      error={new Error('yabai')}
      preamble='Test error.'
      onContinue={() => {}}
    />
  </div>
)

export function main() {
  sceneRoot.render(<ErrorScene />)
}
