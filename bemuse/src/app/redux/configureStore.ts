import { configureStore as createStore } from '@reduxjs/toolkit'
import { compose, Middleware } from 'redux'

import { collectionFetchMiddleware } from './collectionFetchMiddleware.js'
import { collectionLoader } from './collectionLoader.js'
import { optionsStorageMiddleware } from './optionsStorageMiddleware.js'
import { reducer } from './ReduxState.js'

declare global {
  interface Window {
    devToolsExtension?: typeof compose
  }
}

export default function configureStore() {
  const devTools = () =>
    window.devToolsExtension ? window.devToolsExtension() : <T>(f: T) => f
  const middleware: Middleware[] = [
    optionsStorageMiddleware(),
    collectionFetchMiddleware,
    collectionLoader,
    devTools,
  ]
  const store = createStore({ reducer, middleware })
  return store
}
