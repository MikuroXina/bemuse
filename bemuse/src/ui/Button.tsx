import './Button.scss'

import { forwardRef, type ReactNode } from 'react'

const Button = forwardRef<
  HTMLButtonElement,
  {
    children?: ReactNode
    onClick?: React.DOMAttributes<HTMLButtonElement>['onClick']
  }
>(function Button({ children, onClick }, ref) {
  return (
    <button className='Button' onClick={onClick} ref={ref}>
      {children}
    </button>
  )
})

export default Button
