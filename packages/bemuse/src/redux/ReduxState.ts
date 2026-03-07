// This module defines the state shape, behavior, and actions of the Redux store.
//
// - Use action constants to create actions. They are in past tense, describing
//   what happened.
// - The reducers are used to apply the action to the state. Domain logic should
//   not be here. Instead, put them in entities.
// - The selectors can be used to query data from the store.
//

import type { SongMetadataInCollection } from '@mikuroxina/bemuse-types'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { enableMapSet } from 'immer'

import * as MusicSearchText from '../app/entities/MusicSearchText.js'
import * as MusicSelection from '../app/entities/MusicSelection.js'
import * as Options from '../app/entities/Options.js'

enableMapSet()

export interface AppState {
  customSongs: SongMetadataInCollection[]
  musicSearchText: MusicSearchText.MusicSearchTextState
  musicSelection: MusicSelection.MusicSelectionState
  options: Options.OptionsState
  currentSongReadme: string
  rageQuit: boolean
}

// Slice
export const customSongsSlice = createSlice({
  name: 'customSongs',
  initialState: [] as SongMetadataInCollection[],
  reducers: {
    CUSTOM_SONG_LOADED: (
      _state,
      { payload: { song } }: PayloadAction<{ song: SongMetadataInCollection }>
    ) => [song],
    CUSTOM_SONGS_LOADED: (
      _state,
      {
        payload: { songs },
      }: PayloadAction<{ songs: SongMetadataInCollection[] }>
    ) => songs,
  },
})
export const currentSongReadmeSlice = createSlice({
  name: 'currentSongReadme',
  initialState: 'Omachi kudasai…',
  reducers: {
    README_LOADING_STARTED: () => 'Omachi kudasai…',
    README_LOADING_ERRORED: (
      _state,
      { payload: { url } }: PayloadAction<{ url: string }>
    ) => 'Cannot download ' + url,
    README_LOADED: (
      _state,
      { payload: { text } }: PayloadAction<{ text: string }>
    ) => text,
  },
})
export const rageQuitSlice = createSlice({
  name: 'rageQuit',
  initialState: false,
  reducers: {
    RAGEQUITTED: () => true,
    RAGEQUIT_DISMISSED: () => false,
  },
})

// Reducer
export const reducer = {
  customSongs: customSongsSlice.reducer,
  musicSearchText: MusicSearchText.musicSearchTextSlice.reducer,
  musicSelection: MusicSelection.musicSelectionSlice.reducer,
  options: Options.optionsSlice.reducer,
  currentSongReadme: currentSongReadmeSlice.reducer,
  rageQuit: rageQuitSlice.reducer,
}

// Selectors
export const selectCustomSongs = (state: AppState) => state.customSongs

export const selectSearchInputText = (state: AppState) =>
  MusicSearchText.inputText(state.musicSearchText)

export const selectSearchText = (state: AppState) =>
  MusicSearchText.searchText(state.musicSearchText)

export const selectMusicSelection = (state: AppState) => state.musicSelection

export const selectReadmeTextForSelectedSong = (state: AppState) =>
  state.currentSongReadme

export const selectOptions = (state: AppState) => state.options

export const selectPlayMode = (store: AppState) =>
  Options.playMode(store.options)

export const selectRageQuittedFlag = (store: AppState) => store.rageQuit
