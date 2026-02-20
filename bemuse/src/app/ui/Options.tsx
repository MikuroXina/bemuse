import './Options.scss'

import Panel from '@bemuse/ui/Panel.js'

import OptionsAdvanced from './OptionsAdvanced.js'
import OptionsInput from './OptionsInput.js'
import OptionsPlayer from './OptionsPlayer.js'

export interface OptionsProps {
  onClose?: () => void
}

const Options = ({ onClose }: OptionsProps) => (
  <div className='Options'>
    <div className='Optionsのa'>
      <Panel title='Player Settings'>
        <OptionsPlayer onClose={onClose} />
      </Panel>
    </div>
    <div className='Optionsのb'>
      <Panel title='Input Settings'>
        <OptionsInput />
      </Panel>
      <Panel title='Advanced Settings'>
        <OptionsAdvanced />
      </Panel>
    </div>
  </div>
)

export default Options
