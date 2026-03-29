import { createContext } from 'react'

import type { RankingService } from './index.js'
import FakeOnlineService from './scoreboard-system/fake-online-service.js'

export const RankingServiceContext = createContext<RankingService>(
  new FakeOnlineService()
)
