import ModalPopup from '@bemuse/components/common/ModalPopup.js'
import Options from '@bemuse/components/options/Options.js'
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
