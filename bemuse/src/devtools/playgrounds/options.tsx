import Options from '@bemuse/app/ui/Options'
import ModalPopup from '@bemuse/ui/ModalPopup'
import { sceneRoot } from '@bemuse/utils/main-element'
import React from 'react'

const noop = () => {}

const OptionsPlayground = () => (
  <ModalPopup visible onBackdropClick={noop}>
    <Options onClose={noop} />
  </ModalPopup>
)

export function main() {
  sceneRoot.render(<OptionsPlayground />)
}
