import { Auth0Provider } from '@auth0/auth0-react'
import { StrictMode } from 'react'

import { App } from './view/app'

export interface ViewProps {
  auth0Audience: string
  auth0ClientId: string
  auth0Domain: string
}

export function View({ auth0Audience, auth0ClientId, auth0Domain }: ViewProps) {
  return (
    <StrictMode>
      <Auth0Provider
        clientId={auth0ClientId}
        domain={auth0Domain}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: auth0Audience,
        }}
      >
        <App />
      </Auth0Provider>
    </StrictMode>
  )
}
