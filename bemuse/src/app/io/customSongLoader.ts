// The singleton IO context. This file is needed because many parts of
// our application still depends on a singleton.
//

import type { ICustomSongResources } from '@bemuse/resources/types.js'

import {
  loadSongFromResources,
  type LoadSongOptions,
} from '../../custom-song-loader/index.js'

// Configure a custom song loader which loads custom song from resources.
export const customSongLoader = {
  loadSongFromResources: async (
    resources: ICustomSongResources,
    options?: LoadSongOptions
  ) => {
    const song = await loadSongFromResources(resources, options)
    song.id = '__custom_' + Date.now()
    song.custom = true
    return song
  },
} as const
export type CustomSongLoader = typeof customSongLoader
