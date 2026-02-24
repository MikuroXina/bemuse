import './OptionsSpeed.scss'

import { memo } from 'react'

import OptionsButton from './OptionsButton.js'
import OptionsInputField from './OptionsInputField.js'

export interface OptionsSpeedProps {
  value: number
  onChange: (speed: number) => void
}

const parseSpeed = (speedString: string): number =>
  +(+speedString || 1.0).toFixed(1)

const stringifySpeed = (speed: number): string => speed.toFixed(1)

const tickAmount = (speed: number) => {
  if (speed >= 0.5) {
    return 0.5
  }
  return 0.1
}

const OptionsSpeed = ({ value, onChange }: OptionsSpeedProps) => {
  const handleMinusButtonClick = () => {
    const nextSpeed = value - tickAmount(value)
    onChange(nextSpeed)
  }

  const handlePlusButtonClick = () => {
    const nextSpeed = value + tickAmount(value)
    onChange(nextSpeed)
  }

  const handleSpeedInputChange = (nextSpeed: number) => {
    onChange(nextSpeed)
  }

  return (
    <div className='OptionsSpeed'>
      <span className='OptionsSpeedのminus'>
        <OptionsButton onClick={handleMinusButtonClick}>-</OptionsButton>
      </span>
      <OptionsInputField
        value={value}
        parse={parseSpeed}
        stringify={stringifySpeed}
        validator={/^\d+(?:\.\d)?$/}
        onChange={handleSpeedInputChange}
      />
      <span className='OptionsSpeedのplus'>
        <OptionsButton onClick={handlePlusButtonClick}>+</OptionsButton>
      </span>
    </div>
  )
}

export default memo(OptionsSpeed)
