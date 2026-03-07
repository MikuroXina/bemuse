import type { Song } from '@bemuse/collection-model/types.js'
import { getSongResources } from '@bemuse/music-collection/getSongResources.js'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AnyAction, Dispatch } from 'redux'

import { currentSongReadmeSlice } from '../../redux/ReduxState.js'

export function useReadme(serverUrl: string, song: Song): string | null {
  const dispatch = useDispatch()
  const [readme, setReadme] = useState<string | null>(null)

  useEffect(() => {
    requestReadmeForUrl(serverUrl, song, dispatch)
      .then(setReadme)
      .catch(console.error)
  }, [serverUrl, song])

  return readme
}

async function requestReadmeForUrl(
  serverUrl: string,
  song: Song,
  dispatch: Dispatch<AnyAction>
): Promise<string> {
  dispatch(currentSongReadmeSlice.actions.README_LOADING_STARTED())
  try {
    const resources = getSongResources(song, serverUrl)
    const readme = song.readme
      ? await resources.baseResources
          .file(song.readme)
          .then((f) => f.read())
          .then((ab) => new Blob([ab], { type: 'text/plain' }).text())
      : ''
    const text = stripFrontMatter(readme)
    dispatch(currentSongReadmeSlice.actions.README_LOADED({ text }))
    return text
  } catch (e) {
    dispatch(
      currentSongReadmeSlice.actions.README_LOADING_ERRORED({
        url: song.readme ?? '',
      })
    )
    throw e
  }
}

function stripFrontMatter(text: string) {
  return text.replace(/\r\n|\r|\n/g, '\n').replace(/^---\n[\s\S]*?\n---/, '')
}
