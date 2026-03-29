import { useAuth0 } from '@auth0/auth0-react'
import { storeAccessToken } from '@bemuse/online/scoreboard-system/mx-online-service.js'
import { useEffect } from 'react'

import styles from './panel.module.css'

export function LoginPanel() {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    loginWithRedirect,
    getAccessTokenSilently,
  } = useAuth0()

  useEffect(() => {
    if (isAuthenticated) {
      ;(async () => {
        const token = await getAccessTokenSilently()
        storeAccessToken(token)
        if (window.opener) {
          ;(window.opener as Window).postMessage([])
        }
      })().catch(console.log)
    }
  }, [getAccessTokenSilently, isAuthenticated])

  if (isLoading) {
    return <p className={styles.status}>Loading…</p>
  }
  if (error) {
    return (
      <div>
        <h2 className={styles.subtitle}>Something went wrong</h2>
        <p className={styles.errorMessage}>{error.message}</p>
      </div>
    )
  }
  if (!isAuthenticated) {
    return (
      <button
        className={styles.primaryActionButton}
        onClick={() => loginWithRedirect()}
      >
        Log In / Sign Up
      </button>
    )
  }

  return (
    <div>
      <p className={styles.primary}>
        You have been succeed to log in as {user?.nickname ?? '(unnamed)'}!
      </p>
      <p className={styles.secondary}>You can close this window anytime.</p>
    </div>
  )
}
