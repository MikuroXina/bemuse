import { hydrateRoot } from 'react-dom/client'

import { View } from './view.js'

let started = false

function main() {
  if (started) {
    return
  }
  started = true
  hydrateRoot(document.getElementById('root')!, <View />)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}
