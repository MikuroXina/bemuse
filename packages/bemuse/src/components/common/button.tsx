import { forwardRef, type ReactNode } from 'react'

import styles from './button.module.scss'

const Button = forwardRef<
  HTMLButtonElement,
  {
    children?: ReactNode
    onClick?: React.DOMAttributes<HTMLButtonElement>['onClick']
  }
>(function Button({ children, onClick }, ref) {
  return (
    <button className={styles.button} onClick={onClick} ref={ref}>
      {children}
    </button>
  )
})

export default Button
