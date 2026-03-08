import OptionsButton from './OptionsButton.js'
import OptionsInputField from './OptionsInputField.js'
import styles from './OptionsSpeed.module.scss'

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
    <div data-testid='options-speed'>
      <span className={styles.minus}>
        <OptionsButton
          className={styles.button}
          onClick={handleMinusButtonClick}
        >
          -
        </OptionsButton>
      </span>
      <OptionsInputField
        className={styles.field}
        key={value}
        value={value}
        parse={parseSpeed}
        stringify={stringifySpeed}
        validator={/^\d+(?:\.\d)?$/}
        onChange={handleSpeedInputChange}
      />
      <span className={styles.plus}>
        <OptionsButton
          className={styles.button}
          onClick={handlePlusButtonClick}
        >
          +
        </OptionsButton>
      </span>
    </div>
  )
}

export default OptionsSpeed
