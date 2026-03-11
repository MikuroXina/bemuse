import type { ReactNode } from 'react'

import styles from './options-checkbox.module.scss'

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
    <span className={styles.checkbox}>
      <label>
        <input type='checkbox' checked={checked} onChange={onToggle} />
        <span>{children}</span>
      </label>
    </span>
  )
}

export default OptionsCheckbox
