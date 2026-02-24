import './OptionsPlayer.scss'

import type { ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  isAutoVelocityEnabled,
  isBackgroundAnimationsEnabled,
  isGaugeEnabled,
  isPreviewEnabled,
  laneCover,
  leadTime,
  optionsSlice,
  type OptionsState,
  panelPlacement,
  scratchPosition,
  speed,
} from '../../app/entities/Options.js'
import { type AppState, selectOptions } from '../../redux/ReduxState.js'
import OptionsButton from './OptionsButton.js'
import OptionsCheckbox from './OptionsCheckbox.js'
import OptionsInputField from './OptionsInputField.js'
import { Panel, Scratch } from './OptionsPlayerGraphics.js'
import { OptionsPlayerSelector } from './OptionsPlayerSelector.js'
import OptionsSpeed from './OptionsSpeed.js'

interface SettingRowProps<T> {
  selector: (options: OptionsState) => T
  label: string
  isVisible?: (options: OptionsState) => boolean
  renderControl: (options: T) => JSX.Element
  help?: ReactNode
}

const SettingRow = <T,>({
  selector,
  label,
  isVisible,
  help,
  renderControl,
}: SettingRowProps<T>) => {
  const options = useSelector(selectOptions)
  const value = useSelector((state: AppState) => selector(selectOptions(state)))
  const visible = isVisible ? isVisible(options) : true
  const control = renderControl(value)
  return (
    <OptionsPlayer.Row label={label} hidden={!visible}>
      {control}
      {!!help && <div className='OptionsPlayerのhelp'>{help}</div>}
    </OptionsPlayer.Row>
  )
}

const OptionsPlayer = ({ onClose }: { onClose?: () => void }) => {
  const dispatch = useDispatch()

  return (
    <div className='OptionsPlayer'>
      <SettingRow
        selector={speed}
        label='Speed'
        isVisible={(options) => !isAutoVelocityEnabled(options)}
        renderControl={(speed) => (
          <OptionsSpeed
            value={speed}
            onChange={(speed) => {
              dispatch(optionsSlice.actions.CHANGE_SPEED({ speed }))
            }}
          />
        )}
        help={
          <span>
            You can also change the speed in-game
            <br />
            using the Up and Down arrow keys.
          </span>
        }
      />

      <SettingRow
        selector={leadTime}
        label='LeadTime'
        isVisible={(options) => isAutoVelocityEnabled(options)}
        renderControl={(leadTime) => (
          <OptionsInputField
            parse={(str) => parseInt(str, 10)}
            stringify={(value) => String(value) + 'ms'}
            validator={/^\d+(ms)?$/}
            value={leadTime}
            onChange={(leadTime) =>
              dispatch(optionsSlice.actions.CHANGE_LEAD_TIME({ leadTime }))
            }
            style={{ width: '5em' }}
          />
        )}
        help={
          <span>
            Speed will be automatically adjusted
            <br />
            to maintain a consistent note velocity.
          </span>
        }
      />

      <SettingRow
        selector={scratchPosition}
        label='Scratch'
        renderControl={(scratchPosition) => (
          <OptionsPlayerSelector
            options={[
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
              { value: 'off', label: 'Disabled' },
            ]}
            defaultValue={scratchPosition}
            onSelect={(position) =>
              dispatch(
                optionsSlice.actions.CHANGE_SCRATCH_POSITION({ position })
              )
            }
            Item={Scratch}
          />
        )}
      />

      <SettingRow
        selector={panelPlacement}
        label='Panel'
        renderControl={(panelPlacement) => (
          <OptionsPlayerSelector
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
              { value: '3d', label: '3D [Beta]' },
            ]}
            onSelect={(placement) =>
              dispatch(
                optionsSlice.actions.CHANGE_PANEL_PLACEMENT({ placement })
              )
            }
            defaultValue={panelPlacement}
            Item={Panel}
          />
        )}
      />

      <SettingRow
        selector={laneCover}
        label='Cover'
        renderControl={(laneCover) => (
          <OptionsInputField
            parse={(str) => parseInt(str, 10) / 100}
            stringify={(value) => Math.round(value * 100 || 0) + '%'}
            validator={/^-?\d+(%)?$/}
            value={laneCover}
            onChange={(laneCover) =>
              dispatch(optionsSlice.actions.CHANGE_LANE_COVER({ laneCover }))
            }
            style={{ width: '5em' }}
          />
        )}
      />

      <SettingRow
        selector={isBackgroundAnimationsEnabled}
        label='BGA'
        renderControl={(isBackgroundAnimationsEnabled) => (
          <OptionsCheckbox
            checked={isBackgroundAnimationsEnabled}
            onToggle={() =>
              dispatch(optionsSlice.actions.TOGGLE_BACKGROUND_ANIMATIONS())
            }
          >
            Enable background animations{' '}
            <span className='OptionsPlayerのhint'>(720p, alpha)</span>
          </OptionsCheckbox>
        )}
      />

      <SettingRow
        selector={isAutoVelocityEnabled}
        label='AutoVel'
        renderControl={(isAutoVelocityEnabled) => (
          <OptionsCheckbox
            checked={isAutoVelocityEnabled}
            onToggle={() =>
              dispatch(optionsSlice.actions.TOGGLE_AUTO_VELOCITY())
            }
          >
            Maintain absolute note velocity{' '}
            <span className='OptionsPlayerのhint'>(advanced)</span>
          </OptionsCheckbox>
        )}
      />

      <SettingRow
        selector={isGaugeEnabled}
        label='Gauge'
        renderControl={(isGaugeEnabled) => (
          <OptionsCheckbox
            checked={isGaugeEnabled}
            onToggle={() => dispatch(optionsSlice.actions.TOGGLE_GAUGE())}
          >
            Show expert gauge{' '}
            <span className='OptionsPlayerのhint'>(experimental)</span>
          </OptionsCheckbox>
        )}
      />

      <SettingRow
        selector={isPreviewEnabled}
        label='Preview'
        renderControl={(isPreviewEnabled) => (
          <OptionsCheckbox
            checked={isPreviewEnabled}
            onToggle={() => dispatch(optionsSlice.actions.TOGGLE_PREVIEW())}
          >
            Enable music preview
          </OptionsCheckbox>
        )}
      />

      <div className='OptionsPlayerのbuttons'>
        <OptionsButton onClick={onClose}>Save & Exit</OptionsButton>
      </div>
    </div>
  )
}

export interface OptionsPlayerRowProps {
  hidden: boolean
  label: ReactNode
  children: ReactNode
}

const OptionsPlayerRow = ({
  hidden,
  label,
  children,
}: OptionsPlayerRowProps) => (
  <div className='OptionsPlayerのrow' style={{ display: hidden ? 'none' : '' }}>
    <label>{label}</label>
    <div>{children}</div>
  </div>
)

OptionsPlayer.Row = OptionsPlayerRow

export default OptionsPlayer
