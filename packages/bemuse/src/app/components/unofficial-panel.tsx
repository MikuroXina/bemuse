import DialogContent, {
  Buttons,
} from '@bemuse/components/common/dialog-content.js'
import Panel from '@bemuse/components/common/panel.js'
import OptionsButton from '@bemuse/components/options/options-button.js'

import styles from './unofficial-panel.module.scss'

export interface UnofficialPanelProps {
  onClose: () => void
}

const UnofficialPanel = ({ onClose }: UnofficialPanelProps) => (
  <div className={styles.container}>
    <Panel className={styles.panel} title='Unofficial Music Server'>
      <DialogContent>
        <p>
          You are now playing in an <strong>unofficial music server</strong>.
          This music server is not maintained or endorsed by Bemuse or Bemuse’s
          developers.
        </p>
        <Buttons>
          <OptionsButton onClick={onClose}>Close</OptionsButton>
        </Buttons>
      </DialogContent>
    </Panel>
  </div>
)

export default UnofficialPanel
