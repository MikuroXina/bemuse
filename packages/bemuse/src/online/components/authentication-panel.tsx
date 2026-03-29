import djBemuse from '@bemuse/app/components/about-scene/DJBM.png'
import Panel from '@bemuse/components/common/panel.js'
import OptionsButton from '@bemuse/components/options/options-button'
import { useState } from 'react'

import { useLogInMutation } from '../index.js'
import styles from './authentication-panel.module.scss'

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
  const logInMutation = useLogInMutation()
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

  const doLogIn = async () => {
    logInMutation.mutate([])
    onFinish?.()
    return 'Welcome back!'
  }

  const onClickLogIn = () => {
    runPromise(doLogIn())
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
          <div className={styles.vCenter}>
            <Message state={auth} />
            <OptionsButton onClick={onClickLogIn}>
              Log In / Sign Up
            </OptionsButton>
          </div>
        </div>
      </div>
    </Panel>
  )
}

export default AuthenticationPanel
