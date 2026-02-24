import type { SongMetadataInCollection } from '@mikuroxina/bemuse-types'
import type { AnyAction, Middleware } from 'redux'

import { musicSelectionSlice } from '../app/entities/MusicSelection.js'
import findMatchingSong from '../app/interactors/findMatchingSong.js'
import { getInitiallySelectedSong } from '../app/query-flags.js'
import { collectionsSlice } from './ReduxState.js'

// Configure a collection loader, which loads the Bemuse music collection.
export const collectionLoader: Middleware =
  ({ dispatch }) =>
  (next) =>
  <A extends AnyAction>(action: A) => {
    if (action.type !== collectionsSlice.actions.COLLECTION_LOADED.type) {
      return next(action)
    }
    const ret = next(action)
    const initiallySelectedSong = getInitiallySelectedSong()
    if (initiallySelectedSong) {
      const matchingSong = findMatchingSong({
        songs: action.data.songs,
        getTitle: (song: SongMetadataInCollection) => song.title,
        title: initiallySelectedSong,
      })
      if (matchingSong) {
        dispatch(
          musicSelectionSlice.actions.MUSIC_SONG_SELECTED({
            songId: matchingSong.id,
          })
        )
      }
    }
    return ret
  }
