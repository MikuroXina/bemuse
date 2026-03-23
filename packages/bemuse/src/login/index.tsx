import { Auth0Provider } from '@auth0/auth0-react'
import { createRoot } from 'react-dom/client'

import styles from './index.module.css'
import { LoginPanel } from './panel'

function Page() {
  return (
    <div className={styles.page}>
      <title>Bemuse MX Online Ranking Service</title>
      <h1 className={styles.title}>
        Welcome to Bemuse MX Online Ranking Service!
      </h1>
      <div className={styles.panelContainer}>
        <LoginPanel />
      </div>
    </div>
  )
}

export async function main() {
  const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID } = import.meta.env
  createRoot(document.getElementById('scene-root')!).render(
    <Auth0Provider
      domain={VITE_AUTH0_DOMAIN}
      clientId={VITE_AUTH0_CLIENT_ID}
      useRefreshTokens
      authorizationParams={{
        redirect_uri: window.location.origin + '?mode=login',
      }}
    >
      <Page />
    </Auth0Provider>
  )
}
