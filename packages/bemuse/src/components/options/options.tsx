import Panel from '@bemuse/components/common/panel.js'

import styles from './options.module.scss'
import OptionsAdvanced from './options-advanced.js'
import OptionsInput from './options-input.js'
import OptionsPlayer from './options-player.js'

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
