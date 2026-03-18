import { hydrateRoot } from 'react-dom/client'

import { View } from '../view.js'

hydrateRoot(
  document.getElementById('root')!,
  <View
    auth0Audience={import.meta.env.VITE_AUTH0_AUDIENCE}
    auth0ClientId={import.meta.env.VITE_AUTH0_DOMAIN}
    auth0Domain={import.meta.env.VITE_AUTH0_CLIENT_ID}
    baseUrl={import.meta.env.BASE_URL}
  />
)
