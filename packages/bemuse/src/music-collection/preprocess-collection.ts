import type { Song } from '@bemuse/collection-model/types'
import type {
  MusicServerIndex,
  SongMetadataInCollection,
} from '@mikuroxina/bemuse-types'
import { type Draft, produce } from 'immer'

export interface Preprocessed extends MusicServerIndex {
  songOfTheDayEnabled?: boolean
  songs: Song[]
}

export const preprocessCollection = produce((draft: Draft<Preprocessed>) => {
  draft.songs = draft.songs.map((song) => preprocessSong(song))
  if (draft.songOfTheDayEnabled) {
    for (let i = 0; i < Math.min(draft.songs.length, 3); ++i) {
      draft.songs[i].songOfTheDay = true
    }
  }
})

function preprocessSong(
  song: SongMetadataInCollection
): SongMetadataInCollection {
  if (!song.chart_names) {
    return song
  }
  return produce(song, (draft) => {
    if (draft.charts) {
      draft.charts = draft.charts.map((chart) => {
        const name = song.chart_names![chart.file]
        if (!name) return chart
        return produce(chart, (draft) => {
          draft.info.subtitles = [...chart.info.subtitles, name]
        })
      })
    }
  })
}

export default preprocessCollection
