import ModalPopup from '@bemuse/components/common/modal-popup.js'
import Options from '@bemuse/components/options/options.js'
import configureStore from '@bemuse/redux/configure-store'
import { sceneRoot } from '@bemuse/utils/main-element.js'
import { Provider } from 'react-redux'

const noop = () => {}

const OptionsPlayground = () => (
  <ModalPopup visible onBackdropClick={noop}>
    <Options onClose={noop} />
  </ModalPopup>
)

export function main() {
  const store = configureStore()
  sceneRoot.render(
    <Provider store={store}>
      <OptionsPlayground />
    </Provider>
  )
}
