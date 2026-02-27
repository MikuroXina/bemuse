import Panel from '@bemuse/ui/Panel.js'

import styles from './Options.module.scss'
import OptionsAdvanced from './OptionsAdvanced.js'
import OptionsInput from './OptionsInput.js'
import OptionsPlayer from './OptionsPlayer.js'

export interface OptionsProps {
  onClose?: () => void
}

const Options = ({ onClose }: OptionsProps) => (
  <div className={styles.container}>
    <div className={styles.second}>
      <Panel className={styles.panel} title='Player Settings'>
        <OptionsPlayer onClose={onClose} />
      </Panel>
    </div>
    <div className={styles.first}>
      <Panel className={styles.panel} title='Input Settings'>
        <OptionsInput />
      </Panel>
      <Panel className={styles.panel} title='Advanced Settings'>
        <OptionsAdvanced />
      </Panel>
    </div>
  </div>
)

export default Options
