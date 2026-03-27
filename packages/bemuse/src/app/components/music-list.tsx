import type { Song } from '@bemuse/collection-model/types.js'
import type { MappingMode } from '@bemuse/rules/mapping-mode.js'
import type { Chart, SongMetadataInCollection } from '@mikuroxina/bemuse-types'

import styles from './music-list.module.scss'
import MusicListItem from './music-list-item.js'

export interface ChartProps {
  bpm: {
    init: number
    max: number
    median: number
    min: number
  }
  duration: number
  file: string
  info: {
    title: string
    artist: string
    genre: string
    subtitles: readonly string[]
    subartists: readonly string[]
    difficulty: number
    level: number
  }
  keys: string
  md5: string
  noteCount: number
}

export interface MusicListProps {
  groups: readonly {
    title: string
    songs: readonly SongMetadataInCollection[]
  }[]
  onDeselect: () => void
  onSelect: (song: Song, chart?: Chart) => void
  selectedSong: SongMetadataInCollection
  selectedChart: Chart
  playMode: MappingMode
  highlight: string
}

const getSelectedChart = (song: Song, selectedChartInProps: Chart) => {
  // Performance issue:
  //
  // We cannot just send `selectedChart` into every MusicListItem,
  // because this will break PureRenderMixin thus causing every MusicListItem
  // to be re-rendered.
  //
  // If the song being rendered does not contain the selected chart, don’t
  // bother sending it in (just keep it as undefined).
  //
  return song.charts.find((chart) => chart === selectedChartInProps)
}

const MusicList = ({
  groups,
  onDeselect,
  onSelect,
  selectedSong,
  selectedChart,
  playMode,
  highlight,
}: MusicListProps) => {
  return (
    <ul className={styles.list} onTouchStart={onDeselect} onClick={onDeselect}>
      {groups.map(({ title, songs }) => [
        <li key={title} className={styles.groupTitle}>
          {title}
        </li>,
        songs.map((song) => (
          <div key={song.id} className={styles.item}>
            <MusicListItem
              song={song}
              selected={song.id === selectedSong.id}
              selectedChart={getSelectedChart(song, selectedChart)}
              playMode={playMode}
              onSelect={(e, song, chart) => {
                e.stopPropagation()
                onSelect(song, chart)
              }}
              highlight={highlight}
            />
          </div>
        )),
      ])}
    </ul>
  )
}

export default MusicList
