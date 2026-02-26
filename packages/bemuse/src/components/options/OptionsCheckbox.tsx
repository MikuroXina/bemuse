import './OptionsCheckbox.scss'

import type { ReactNode } from 'react'

const OptionsCheckbox = ({
  checked,
  children,
  onToggle,
}: {
  checked: boolean
  children?: ReactNode
  onToggle: () => void
}) => {
  return (
    <span className='OptionsCheckbox'>
      <label>
        <input type='checkbox' checked={checked} onChange={onToggle} />
        <span>{children}</span>
      </label>
    </span>
  )
}

export default OptionsCheckbox
