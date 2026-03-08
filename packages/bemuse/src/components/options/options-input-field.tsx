import {
  type ChangeEvent,
  type ComponentProps,
  type FocusEvent,
  useState,
} from 'react'

import styles from './options-input-field.module.scss'

export interface OptionsInputFieldProps<T> {
  stringify: (x: T) => string
  parse: (x: string) => T
  onChange: (newValue: T) => void
  validator: {
    test: (x: string) => boolean
  }
  value: T
}

export const defaultProps: Partial<OptionsInputFieldProps<string>> = {
  stringify: (x) => `${x}`,
  parse: (x) => x,
  onChange: () => {},
}

const OptionsInputField = <T,>(
  props: OptionsInputFieldProps<T> &
    Omit<ComponentProps<'input'>, keyof OptionsInputFieldProps<T>>
) => {
  const {
    stringify,
    parse,
    onChange,
    validator,
    value: defaultValue,
    className,
    ...others
  } = props
  const [value, setValue] = useState(stringify(defaultValue))

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    setValue(input.value)
    const valid = validator.test(input.value)
    input.dataset['valid'] = valid ? 'true' : 'false'
  }
  const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const valid = validator.test(input.value)
    if (valid) {
      onChange(parse(input.value))
    }
  }
  return (
    <input
      {...others}
      type='text'
      value={value}
      onChange={handleInputChange}
      onBlur={handleInputBlur}
      className={`${styles.input} ${className}`}
    />
  )
}

export default OptionsInputField
