import { enableMapSet, produce } from 'immer'

import {
  completeWithValue,
  errorWithReason,
  initLoading,
  LoadState,
} from './LoadState.js'

enableMapSet()

export type CollectionsState<V> = Map<string, LoadState<V>>

export const initialState = new Map<string, LoadState<unknown>>()

export const beginLoading = <V>(url: string) =>
  produce((state: CollectionsState<V>) => state.set(url, initLoading()))

export const completeLoading = <V>(url: string, data: V) =>
  produce((state: CollectionsState<V>) =>
    state.set(url, completeWithValue(data)())
  )

export const errorLoading = <V>(url: string, error: Error) =>
  produce((state: CollectionsState<V>) =>
    state.set(url, errorWithReason(error)())
  )

export const getCollectionByUrl =
  <V>(url: string) =>
  (state: CollectionsState<V>) =>
    state.get(url)
