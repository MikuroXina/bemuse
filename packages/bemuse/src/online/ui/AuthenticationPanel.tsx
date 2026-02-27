import djBemuse from '@bemuse/app/ui/about-scene/DJBM.png'
import { OnlineContext } from '@bemuse/online/instance.js'
import Flex from '@bemuse/ui/Flex.js'
import Panel from '@bemuse/ui/Panel.js'
import { useContext, useState } from 'react'

import AuthenticationForm, {
  type AuthenticationFormData,
  type AuthMode,
} from './AuthenticationForm.js'
import styles from './AuthenticationPanel.module.scss'

export interface AuthenticationPanelProps {
  onFinish?: () => void
}

interface AuthState {
  status: 'idle' | 'loading' | 'completed' | 'error'
  message: string
}

const Message = ({ state }: { state: AuthState }) => {
  if (state.status === 'idle' || !state.message) return null
  return (
    <div className={styles.message} data-status={state.status}>
      {state.message}
    </div>
  )
}

const AuthenticationPanel = ({ onFinish }: AuthenticationPanelProps) => {
  const online = useContext(OnlineContext)
  const [mode, setMode] = useState<AuthMode>('logIn')
  const [auth, setAuth] = useState<AuthState>({ status: 'idle', message: '' })

  const runPromise = (promise: Promise<string>) => {
    setAuth({
      status: 'loading',
      message: 'Omachi kudasai...',
    })
    promise.then(
      (message) => {
        setAuth({
          status: 'completed',
          message: message,
        })
      },
      (error: Error) => {
        setAuth({
          status: 'error',
          message: error.message,
        })
      }
    )
  }

  const doSignUp = async (formData: AuthenticationFormData) => {
    if (!formData.username.trim()) {
      throw new Error('Please enter a username.')
    }
    if (!formData.username.match(/^\S+$/)) {
      throw new Error('Username may not contain spaces.')
    }
    if (formData.username.length < 2) {
      throw new Error('Username must be at least 2 characters long.')
    }
    if (formData.username.length > 24) {
      throw new Error('Username must be at most 24 characters long.')
    }
    if (!formData.password) {
      throw new Error('Please enter a password.')
    }
    if (formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.')
    }
    if (!formData.passwordConfirmation) {
      throw new Error('Please confirm your password.')
    }
    if (formData.password !== formData.passwordConfirmation) {
      throw new Error('Passwords do not match.')
    }
    await online.signUp(formData)
    if (onFinish) onFinish()
    return 'Welcome to Bemuse!'
  }

  const doLogIn = async (formData: AuthenticationFormData) => {
    if (!formData.password.trim()) {
      if (window.confirm('Did you forget your password?')) {
        const email = window.prompt('Please enter your email address.')
        if (email) {
          await online.changePassword({ email })
          throw new Error('Please check your email')
        }
      }
    }
    if (!formData.username.trim()) {
      throw new Error('Please enter your username.')
    }
    if (!formData.password.trim()) {
      throw new Error('Please enter your password.')
    }
    return online.logIn(formData).then(() => {
      if (onFinish) onFinish()
      return 'Welcome back!'
    })
  }

  const onSwitchToLogin = () => setMode('logIn')

  const onSwitchToSignUp = () => setMode('signUp')

  const onSubmit = (formData: AuthenticationFormData) => {
    if (mode === 'signUp') {
      runPromise(doSignUp(formData))
    } else {
      runPromise(doLogIn(formData))
    }
  }

  return (
    <Panel title='Bemuse Online Ranking'>
      <div className={styles.layout} data-testid='authentication-panel'>
        <div className={styles.title}>
          <img src={djBemuse} alt='DJ Bemuse' />
          <div className={styles.identification}>
            Bemuse
            <br />
            Online
            <br />
            Ranking
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.modeSwitcher}>
            <a onClick={onSwitchToLogin} data-active={mode === 'logIn'}>
              Log In
            </a>{' '}
            &middot;{' '}
            <a onClick={onSwitchToSignUp} data-active={mode === 'signUp'}>
              Create an Account
            </a>
          </div>
          <Flex grow='2' />
          <Message state={auth} />
          <AuthenticationForm mode={mode} onSubmit={onSubmit} />
          <Flex grow='3' />
        </div>
      </div>
    </Panel>
  )
}

export default AuthenticationPanel
