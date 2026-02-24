import { isQueryFlagEnabled } from '@bemuse/flags/index.js'
import { createContext } from 'react'

import Online from './index.js'
import OfflineService from './OfflineService.js'
import OnlineService from './scoreboard-system/OnlineService.js'

let instance: Online

if (isQueryFlagEnabled('fake-scoreboard')) {
  instance = new Online(new OnlineService({ fake: true }))
} else if (isQueryFlagEnabled('offline')) {
  instance = new Online(new OfflineService())
} else if (import.meta.env.SCOREBOARD_SERVER) {
  instance = new Online(
    new OnlineService({ server: import.meta.env.SCOREBOARD_SERVER })
  )
} else {
  console.warn(
    'Warning: No server specified. Using a fake scoreboard that resets when you refresh the page.'
  )
  instance = new Online(new OnlineService({ fake: true }))
}

export const OnlineContext = createContext(instance)
