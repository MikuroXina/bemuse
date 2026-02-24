import Options from '@bemuse/components/options/Options.js'
import ModalPopup from '@bemuse/ui/ModalPopup.js'
import { sceneRoot } from '@bemuse/utils/main-element.js'

const noop = () => {}

const OptionsPlayground = () => (
  <ModalPopup visible onBackdropClick={noop}>
    <Options onClose={noop} />
  </ModalPopup>
)

export function main() {
  sceneRoot.render(<OptionsPlayground />)
}
