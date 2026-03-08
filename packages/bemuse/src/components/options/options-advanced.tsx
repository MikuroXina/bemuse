import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import * as Options from '../../app/entities/options.js'
import { type AppState, selectOptions } from '../../redux/redux-state.js'
import styles from './options-advanced.module.scss'
import OptionsButton from './options-button.js'
import OptionsInputField from './options-input-field.js'

const stringifyLatency = (latency: number): string => {
  return Math.round(latency).toString()
}

const parseLatency = (latencyText: string): number => {
  return parseInt(latencyText, 10)
}

const useLatency = (handler: (latency: number) => void) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data.latency === 'number') {
        handler(event.data.latency)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])
}

const OptionsAdvanced = () => {
  const dispatch = useDispatch()
  const latency = useSelector((state: AppState) =>
    Options.audioInputLatency(selectOptions(state))
  )

  const handleAudioInputLatencyChange = (value: number) => {
    dispatch(
      Options.optionsSlice.actions.CHANGE_AUDIO_INPUT_LATENCY({
        latency: value,
      })
    )
  }

  const handleCalibrateButtonClick = () => {
    const options = 'width=640,height=360'
    window.open('?mode=sync', 'sync', options)
  }

  useLatency(handleAudioInputLatencyChange)

  return (
    <div className={styles.advanced}>
      <div className={styles.group}>
        <label>Latency</label>
        <div className={styles.groupItem}>
          <OptionsInputField
            className={styles.field}
            key={latency}
            value={latency}
            parse={parseLatency}
            stringify={stringifyLatency}
            validator={/^\d+?$/}
            onChange={handleAudioInputLatencyChange}
          />
          <label>milliseconds</label>
        </div>
        <OptionsButton onClick={handleCalibrateButtonClick}>
          Calibrate
        </OptionsButton>
      </div>
    </div>
  )
}

export default OptionsAdvanced
