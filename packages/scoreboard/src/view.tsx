import { Auth0Provider } from '@auth0/auth0-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'

import { App } from './view/app'

const queryClient = new QueryClient()

export interface ViewProps {
  auth0Audience: string
  auth0ClientId: string
  auth0Domain: string
  baseUrl: string
}

export function View({
  auth0Audience,
  auth0ClientId,
  auth0Domain,
  baseUrl,
}: ViewProps) {
  return (
    <StrictMode>
      <Auth0Provider
        clientId={auth0ClientId}
        domain={auth0Domain}
        authorizationParams={{
          redirect_uri: `${baseUrl}/api/v1/auth/callback`,
          audience: auth0Audience,
        }}
      >
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </Auth0Provider>
    </StrictMode>
  )
}
