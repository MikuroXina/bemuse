import { createContext } from 'react'

import type { RankingService } from './index.js'

export const RankingServiceContext = createContext<RankingService>({
  isAuthenticated: () => false,
  me: () => Promise.resolve(null),
  logIn: () => Promise.resolve(null),
  logOut: () => Promise.resolve(),
  submitScore: () => Promise.reject(new Error('no context provided')),
  retrieveRecord: () => Promise.resolve(null),
  retrieveScoreboard: () => Promise.resolve({ data: [] }),
})
