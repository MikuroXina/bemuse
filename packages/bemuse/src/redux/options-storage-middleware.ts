import {
  createListenerMiddleware,
  type ListenerMiddlewareInstance,
} from '@reduxjs/toolkit'

import type { AppState } from './redux-state.js'

export const optionsStorageMiddleware = (
  storage: Storage
): ListenerMiddlewareInstance<AppState> => {
  const middleware = createListenerMiddleware<AppState>({
    extra: storage,
  })
  middleware.startListening({
    predicate: (action) => action.type.startsWith('options/'),
    effect: (_, listener) => {
      const { options } = listener.getState()
      for (const key of Object.keys(options)) {
        storage.setItem(key, options[key])
      }
    },
  })
  return middleware
}
