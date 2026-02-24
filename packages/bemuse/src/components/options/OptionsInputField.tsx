import './OptionsInputField.scss'

import _ from 'lodash'
import type { ChangeEvent, ComponentProps, FocusEvent } from 'react'

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
  const { stringify, parse, onChange, validator, value } = props

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const valid = validator.test(input.value)
    input.classList[valid ? 'remove' : 'add']('is-invalid')
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
      {..._.omit(props, [
        'stringify',
        'parse',
        'onChange',
        'validator',
        'value',
      ])}
      type='text'
      value={stringify(value)}
      onChange={handleInputChange}
      onBlur={handleInputBlur}
      className='OptionsInputField'
    />
  )
}

export default OptionsInputField
