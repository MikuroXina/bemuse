import { hydrateRoot } from 'react-dom/client'

import { View } from './view.js'

let started = false

function main() {
  if (started) {
    return
  }
  started = true
  hydrateRoot(
    document.getElementById('root')!,
    <View
      auth0Audience={import.meta.env.VITE_AUTH0_AUDIENCE}
      auth0ClientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      auth0Domain={import.meta.env.VITE_AUTH0_DOMAIN}
      baseUrl={window.location.origin}
    />
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}
