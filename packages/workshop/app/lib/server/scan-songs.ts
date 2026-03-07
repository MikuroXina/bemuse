import { parse } from 'valibot'
import type { Action } from './reducer'
import type { ServerFile } from './server-file'
import { songMetadataSchema, type SongMetadata } from '@mikuroxina/bemuse-types'
import { save } from './save'

export async function scanSongs(
  serverFile: FileSystemFileHandle,
  data: ServerFile,
  dispatch: (action: Action) => void
): Promise<void> {
  dispatch(['CLEAR_ALL_STATUS', []])

  const selectedUrls = Array.from(
    document.querySelectorAll('[data-entry-url]')
  ).flatMap((el: Element) => {
    return el instanceof HTMLElement && 'selected' in el && el.selected
      ? [el.dataset.entryUrl]
      : []
  })
  console.log({ selectedUrls })
  const shouldUpdate = (url: string): boolean => {
    if (selectedUrls.length > 0) {
      return selectedUrls.includes(url)
    } else {
      const alreadyScanned = data.songs.some((s) => s.path === url)
      return !alreadyScanned
    }
  }
  for (const { url, added, title } of data.urls) {
    if (!shouldUpdate(url)) {
      dispatch(['SET_STATUS', [url, 'skipped']])
      continue
    }
    try {
      dispatch(['SET_STATUS', [url, 'scanning']])
      const response = await fetch(new URL('bemuse-song.json', url).href)
      const parsed = await response.json()
      const songData = parse(songMetadataSchema, parsed)
      data = updateSongData(data, url, {
        ...songData,
        ...(added ? { added: added + 'T00:00:00.000Z' } : {}),
        ...(title ? { title } : {}),
      })
      dispatch(['SET_STATUS', [url, 'completed']])
    } catch (error) {
      dispatch(['SET_STATUS', [url, 'error']])
    }
  }
  await save(serverFile, data)
}

function updateSongData(
  data: ServerFile,
  url: string,
  song: SongMetadata
): ServerFile {
  const index = data.songs.findIndex((s) => s.path === url)
  const entry = {
    ...song,
    id: url.replace(/\/$/, '').split('/').slice(-1)[0],
    path: url,
  }
  if (index > -1) {
    return { ...data, songs: data.songs.with(index, entry) }
  } else {
    return { ...data, songs: [...data.songs, entry] }
  }
}
