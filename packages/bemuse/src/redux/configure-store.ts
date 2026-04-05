import { configureStore as createStore } from '@reduxjs/toolkit'
import { compose } from 'redux'

import { optionsStorageMiddleware } from './options-storage-middleware.js'
import { preloadState, reducer } from './redux-state.js'

declare global {
  interface Window {
    devToolsExtension?: typeof compose
  }
}

export default function configureStore() {
  const storage = localStorage
  const instance = optionsStorageMiddleware(storage)
  const store = createStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(instance.middleware),
    preloadedState: preloadState(storage),
  })
  return store
}
