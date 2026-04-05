import {
  createListenerMiddleware,
  type ListenerMiddlewareInstance,
} from '@reduxjs/toolkit'

import {
  initialState,
  optionsSlice,
  type OptionsState,
} from '../app/entities/options.js'
import type { AppState } from './redux-state.js'

export const loadOptions = (storage: Storage): OptionsState => {
  const options: Record<string, string> = {}
  for (const key of Object.keys(initialState)) {
    options[key] = storage.getItem(key) ?? initialState[key]
  }
  return options as OptionsState
}

export const optionsStorageMiddleware = (
  storage: Storage
): ListenerMiddlewareInstance<AppState> => {
  const middleware = createListenerMiddleware<AppState>({
    extra: storage,
  })
  middleware.startListening({
    type: optionsSlice.actions.LOAD_FROM_STORAGE.type,
    effect: (action, listener) => {
      if (action.type.startsWith('options/')) {
        const { options } = listener.getState()
        for (const key of Object.keys(options)) {
          storage.setItem(key, options[key])
        }
      }
    },
  })
  return middleware
}
