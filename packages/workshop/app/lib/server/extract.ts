import { parse } from 'valibot'
import type { Action } from './reducer'
import { serverFileSchema, type SongEntry } from './server-file'

export async function extract(
  serverFile: FileSystemFileHandle,
  dispatch: (action: Action) => void
): Promise<void> {
  try {
    const file = await serverFile.getFile()
    const text = await file.text()
    const parsed = JSON.parse(text)
    const output = parse(serverFileSchema, parsed)
    sortSongs(output.songs)
    dispatch(['LOAD', { handle: serverFile, data: output }])
  } catch (error) {
    alert('Cannot load server file: ' + error)
    console.error(error)
    dispatch(['CLOSE', []])
  }
}

function sortSongs(songs: SongEntry[]) {
  const sortKey = (song: SongEntry): string => {
    if (song.initial) return 'a'
    if (song.added) return 'b' + song.added
    return 'c'
  }
  return (songs || [])
    .slice()
    .sort((a, b) => sortKey(b).localeCompare(sortKey(a)))
}
