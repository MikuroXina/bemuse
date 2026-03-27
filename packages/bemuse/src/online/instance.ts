import { isQueryFlagEnabled } from '@bemuse/flags/index.js'
import { createContext } from 'react'

import Online from './index.js'
import OfflineService from './offline-service.js'
import FakeOnlineService from './scoreboard-system/fake-online-service.js'
import { MXOnlineService } from './scoreboard-system/mx-online-service.js'

let instance: Online

if (isQueryFlagEnabled('fake-scoreboard')) {
  instance = new Online(new FakeOnlineService())
} else if (isQueryFlagEnabled('offline')) {
  instance = new Online(new OfflineService())
} else if (import.meta.env.VITE_SCOREBOARD_SERVER) {
  instance = new Online(
    new MXOnlineService(import.meta.env.VITE_SCOREBOARD_SERVER)
  )
} else {
  console.warn(
    'Warning: No server specified. Using a fake scoreboard that resets when you refresh the page.'
  )
  instance = new Online(new FakeOnlineService())
}

export const OnlineContext = createContext(instance)
