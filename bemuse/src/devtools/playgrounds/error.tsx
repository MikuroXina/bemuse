import GenericErrorScene from '@bemuse/app/ui/GenericErrorScene'
import { sceneRoot } from '@bemuse/utils/main-element'
import React from 'react'

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
