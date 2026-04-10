import type { Song } from '@bemuse/collection-model/types'

export function filterSongs(
  songs: readonly Song[],
  filterText: string
): Song[] {
  return songs.filter((song) => matches(song, filterText))
}

function matches(song: Song, filterText: string): boolean {
  if (!filterText) return true
  return (
    contains(song.title, filterText) ||
    contains(song.artist, filterText) ||
    contains(song.genre, filterText)
  )
}

function contains(haystack: string, needle: string): boolean {
  return String(haystack.toLowerCase()).indexOf(needle.toLowerCase()) >= 0
}

export default filterSongs
