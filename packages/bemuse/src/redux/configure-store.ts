import { configureStore as createStore } from '@reduxjs/toolkit'
import { compose, type Middleware } from 'redux'

import { optionsStorageMiddleware } from './options-storage-middleware.js'
import { reducer } from './redux-state.js'

declare global {
  interface Window {
    devToolsExtension?: typeof compose
  }
}

export default function configureStore() {
  const devTools = () =>
    window.devToolsExtension ? window.devToolsExtension() : <T>(f: T) => f
  const middleware: Middleware[] = [optionsStorageMiddleware(), devTools]
  const store = createStore({ reducer, middleware })
  return store
}
