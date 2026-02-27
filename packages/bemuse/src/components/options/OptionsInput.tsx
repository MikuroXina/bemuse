import OmniInput, { getName } from '@bemuse/omni-input/index.js'
import difference from 'lodash/difference.js'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createSelector } from 'reselect'

import {
  isContinuousAxisEnabled,
  keyboardMapping,
  nextKeyToEdit,
  optionsSlice,
  playMode,
  scratchPosition,
  sensitivity,
} from '../../app/entities/Options.js'
import type { AppState } from '../../redux/ReduxState.js'
import OptionsButton from './OptionsButton.js'
import OptionsCheckbox from './OptionsCheckbox.js'
import styles from './OptionsInput.module.scss'
import OptionsInputField from './OptionsInputField.js'
import OptionsInputKeys from './OptionsInputKeys.js'
import OptionsInputScratch from './OptionsInputScratch.js'

const selectKeyboardMapping = createSelector(
  (state: AppState) => state.options,
  (options) => keyboardMapping(options)
)

const selectKeyboardMappingTexts = (
  mapping: Record<string, number>
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(mapping).map(([key, value]) => [
      key,
      getName(value.toString()),
    ])
  )

const extractState = createSelector(
  (state: AppState) => state.options,
  selectKeyboardMapping,
  (options, mapping) => ({
    scratch: scratchPosition(options),
    texts: selectKeyboardMappingTexts(mapping),
    mode: playMode(options),
    isContinuous: isContinuousAxisEnabled(options),
    sensitivity: sensitivity(options),
  })
)

const OptionsInput = () => {
  const dispatch = useDispatch()
  const { scratch, texts, mode, isContinuous, sensitivity } =
    useSelector(extractState)
  const [editing, setEditing] = useState<string | null>(null)
  const omniInput = useRef<OmniInput | null>(null)

  const handleEdit = (key: string) => {
    setEditing((editing) => (editing === key ? null : key))
  }

  const handleKey = (keyCode: string) => {
    if (editing) {
      dispatch(
        optionsSlice.actions.CHANGE_KEY_MAPPING({
          mode,
          key: editing,
          keyCode,
        })
      )
      setEditing(nextKeyToEdit(editing, scratch))
    }
  }

  const handleSensitivityChange = (sensitivity: number) => {
    if (sensitivity < 0) sensitivity = 0
    else if (sensitivity >= 10) sensitivity = 9
    omniInput.current?.setGamepadSensitivity(sensitivity)
    dispatch(optionsSlice.actions.CHANGE_SENSITIVITY({ sensitivity }))
  }

  const handleMinusButtonClick = () => {
    handleSensitivityChange(sensitivity - 1)
  }

  const handlePlusButtonClick = () => {
    handleSensitivityChange(sensitivity + 1)
  }

  useEffect(() => {
    const handleKeyboardEvent = (e: KeyboardEvent) => {
      if (editing) {
        e.preventDefault()
      }
    }

    // XXX: debounce is needed because some gamepad inputs trigger multiple
    // buttons
    const input = new OmniInput(window, {
      continuous: isContinuous,
    })
    omniInput.current = input
    let oldPushedKeys: string[] = []
    const timer = setInterval(() => {
      const state = input.update()
      const pushedKeys = Object.keys(state).filter((key) => state[key])
      for (const key of difference(pushedKeys, oldPushedKeys)) {
        handleKey(key)
      }
      oldPushedKeys = pushedKeys
    }, 16)
    window.addEventListener('keydown', handleKeyboardEvent, true)
    return () => {
      clearInterval(timer)
      input.dispose()
      window.removeEventListener('keydown', handleKeyboardEvent, true)
    }
  }, [editing])

  const editIndex = (editing: string | null) => {
    if (editing === 'SC') {
      return 0
    }
    if (editing === 'SC2') {
      return 1
    }
    return -1
  }
  return (
    <div className={styles.input}>
      <div className={styles.binding} data-scratch={scratch}>
        {scratch !== 'off' ? (
          <div className={styles.zone}>
            <div className={styles.control}>
              <OptionsInputScratch
                text={[texts['SC'], texts['SC2']]}
                isEditing={editing === 'SC' || editing === 'SC2'}
                editIndex={editIndex(editing)}
                onEdit={handleEdit}
              />
            </div>
            <div className={styles.title}>Scratch</div>
          </div>
        ) : null}
        <div className={styles.zone}>
          <div className={styles.control}>
            <OptionsInputKeys
              keyboardMode={scratch === 'off'}
              texts={texts}
              editing={editing}
              onEdit={handleEdit}
            />
          </div>
          <div className={styles.title}>Keys</div>
        </div>
      </div>
      <div className={styles.gamepad}>
        <div className={styles.group}>
          <label>Continuous Axis</label>
          <OptionsCheckbox
            checked={isContinuous}
            onToggle={() => {
              dispatch(optionsSlice.actions.TOGGLE_CONTINUOUS_AXIS())
              omniInput.current?.setGamepadContinuousAxisEnabled(!isContinuous)
            }}
          />
        </div>
        <div className={styles.group}>
          <label>Sensitivity</label>
          <div className={styles.sensitivity}>
            <span>
              <OptionsButton
                className={styles.minus}
                onClick={handleMinusButtonClick}
              >
                -
              </OptionsButton>
            </span>
            <OptionsInputField
              className={styles.inputField}
              parse={(str) => parseInt(str, 10) - 1}
              stringify={(value) => String(value + 1)}
              validator={/^\d+$/}
              value={sensitivity}
              onChange={handleSensitivityChange}
            />
            <span>
              <OptionsButton
                className={styles.plus}
                onClick={handlePlusButtonClick}
              >
                +
              </OptionsButton>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OptionsInput
