import DialogContent, {
  Buttons,
} from '@bemuse/components/common/DialogContent.js'
import ModalPopup from '@bemuse/components/common/ModalPopup.js'
import Panel from '@bemuse/components/common/Panel.js'
import OptionsButton from '@bemuse/components/options/OptionsButton.js'
import { useDispatch, useSelector } from 'react-redux'

import * as ReduxState from '../../redux/ReduxState.js'
import styles from './RageQuitPopup.module.css'

function RageQuitPopup() {
  const dispatch = useDispatch()
  const visible = useSelector(ReduxState.selectRageQuittedFlag)
  const onClose = () =>
    dispatch(ReduxState.rageQuitSlice.actions.RAGEQUIT_DISMISSED())

  return (
    <ModalPopup visible={visible} onBackdropClick={onClose}>
      <div className={styles.smallPanel}>
        <Panel title='You just rage-quitted!'>
          <DialogContent>
            <p>I hope you enjoyed the tutorial ^_^</p>
            <p>
              From here, you can play other songs. Start from Level 1 and work
              your way up. And hopefully, someday, you will be able to beat this
              tutorial!
            </p>
            <Buttons>
              <OptionsButton onClick={onClose}>Continue</OptionsButton>
            </Buttons>
          </DialogContent>
        </Panel>
      </div>
    </ModalPopup>
  )
}

export default RageQuitPopup
