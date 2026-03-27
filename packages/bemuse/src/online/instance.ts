import { createContext } from 'react'

import type { Online } from './index.js'

export const OnlineContext = createContext<Online>({
  getCurrentUser: () => null,
  logIn: () => Promise.resolve(null),
  getPersonalRecord: () => Promise.resolve(null),
  logOut: () => Promise.resolve(),
  submitScore: () => Promise.reject(new Error('no context provided')),
  scoreboard: () => Promise.resolve({ data: [] }),
  retrievePersonalRankingEntry: () => Promise.resolve(null),
})
