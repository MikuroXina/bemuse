import type { Song } from '@bemuse/collection-model/types.js'
import orderBy from 'lodash/orderBy'

interface Grouping {
  title: string
  criteria: (song: Song) => boolean
  sort?: (song: Song) => string
  reverse?: boolean
}

const grouping: readonly Grouping[] = [
  { title: 'Custom Songs', criteria: (song) => !!song.custom },
  { title: 'Tutorial', criteria: (song) => !!song.tutorial },
  { title: 'Unreleased', criteria: (song) => !!song.unreleased },
  {
    title: 'Recently Added Songs',
    criteria: (song) =>
      !!song.added && Date.now() - Date.parse(song.added) < 60 * 86400000,
    sort: (song) => song.added ?? '',
    reverse: true,
  },
  {
    title: 'Random Songs of the Day',
    criteria: (song) => !!song.songOfTheDay,
  },
  { title: '☆', criteria: () => true },
]

export function groupSongsIntoCategories(songs: readonly Song[]) {
  const groups = grouping.map((group) => ({
    input: group,
    output: { title: group.title, songs: [] as Song[] },
  }))
  for (const song of songs) {
    for (const { input, output } of groups) {
      if (input.criteria(song)) {
        output.songs.push(song)
        break
      }
    }
  }
  for (const { input, output } of groups) {
    if (input.sort) {
      output.songs = orderBy(
        output.songs,
        [input.sort],
        [input.reverse ? 'desc' : 'asc']
      )
    } else if (input.reverse) {
      output.songs.reverse()
    }
  }
  return groups
    .map(({ output }) => output)
    .filter((group) => group.songs.length > 0)
}

export default groupSongsIntoCategories
