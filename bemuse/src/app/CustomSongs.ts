import {
  loadSongFromResources,
  LoadSongOptions,
} from '@bemuse/custom-song-loader/index.js'
import type { ICustomSongResources } from '@bemuse/resources/types.js'
import { useSyncExternalStore } from 'react'
import type { AnyAction, Dispatch } from 'redux'

import { customSongsSlice } from '../redux/ReduxState.js'

const loadSongFromResourcesWrapper = async (
  resources: ICustomSongResources,
  options?: LoadSongOptions
) => {
  const song = await loadSongFromResources(resources, options)
  song.id = '__custom_' + Date.now()
  song.custom = true
  return song
}

let loaderLog: string[] | null = null
const listeners = new Set<() => void>()

export function useCustomSongLoaderLog() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    () => loaderLog
  )
}

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export async function loadCustomSong(
  resources: ICustomSongResources,
  initialLog: readonly string[],
  dispatch: Dispatch<AnyAction>
) {
  loaderLog = [...initialLog]
  try {
    const song = await loadSongFromResourcesWrapper(resources, {
      onMessage(text: string) {
        loaderLog?.push(text)
        emit()
      },
    })
    if (song && song.charts && song.charts.length) {
      loaderLog = null
      emit()
      dispatch(customSongsSlice.actions.CUSTOM_SONG_LOADED({ song }))
      return song
    }
    loaderLog = null
    emit()
  } catch (e) {
    const text = `Error caught: ${e}`
    loaderLog?.push(text)
    emit()
    throw e
  }
}
