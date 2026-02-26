import OptionsButton from '@bemuse/components/options/OptionsButton.js'
import {
  type InputEvent,
  type KeyboardEvent,
  type MouseEvent,
  useRef,
} from 'react'

import styles from './AuthenticationForm.module.scss'

export interface AuthenticationFormData {
  username: string
  password: string
  passwordConfirmation: string
  email: string
}

export type AuthMode = 'logIn' | 'signUp'

export interface AuthenticationFormProps {
  onSubmit: (formData: AuthenticationFormData) => void
  mode: AuthMode
}

const AuthenticationForm = ({ onSubmit, mode }: AuthenticationFormProps) => {
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const passwordConfirmRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  const onButtonClick = (e: MouseEvent) => {
    e.preventDefault()
    onSubmit({
      username: usernameRef.current?.value ?? '',
      password: passwordRef.current?.value ?? '',
      passwordConfirmation: passwordConfirmRef.current?.value ?? '',
      email: emailRef.current?.value ?? '',
    })
  }
  const preventPropagate = (
    e: KeyboardEvent<HTMLFormElement> | InputEvent<HTMLFormElement>
  ) => {
    e.stopPropagation()
  }

  return (
    <form
      className={styles.container}
      onKeyDown={preventPropagate}
      onKeyUp={preventPropagate}
      onBeforeInput={preventPropagate}
    >
      <div className={styles.group}>
        <label>
          <span className={styles.label}>Username</span>
          <span className={styles.control}>
            <input type='text' defaultValue='' ref={usernameRef} />
          </span>
        </label>
        <label hidden={mode !== 'signUp'}>
          <span className={styles.label}>Email</span>
          <span className={styles.control}>
            <input type='email' defaultValue='' ref={emailRef} />
          </span>
        </label>
        <label>
          <span className={styles.label}>Password</span>
          <span className={styles.control}>
            <input type='password' defaultValue='' ref={passwordRef} />
          </span>
        </label>
        <label hidden={mode !== 'signUp'}>
          <span className={styles.label}>Confirm Password</span>
          <span className={styles.control}>
            <input type='password' defaultValue='' ref={passwordConfirmRef} />
          </span>
        </label>
        <div className={styles.buttons}>
          <OptionsButton onClick={onButtonClick}>
            {mode === 'signUp' ? 'Sign Me Up' : 'Log In'}
          </OptionsButton>
        </div>
      </div>
    </form>
  )
}

export default AuthenticationForm
