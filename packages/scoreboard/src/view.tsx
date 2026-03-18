import { Auth0Provider } from '@auth0/auth0-react'
import { StrictMode } from 'react'

import { App } from './view/app'

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
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </head>
      <body>
        <div id='root'>
          <StrictMode>
            <Auth0Provider
              clientId={auth0ClientId}
              domain={auth0Domain}
              authorizationParams={{
                redirect_uri: new URL('/callback', baseUrl),
                audience: auth0Audience,
              }}
            >
              <App />
            </Auth0Provider>
          </StrictMode>
        </div>
      </body>
    </html>
  )
}
