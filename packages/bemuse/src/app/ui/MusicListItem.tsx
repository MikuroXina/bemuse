import type { Song } from '@bemuse/collection-model/types.js'
import getPlayableCharts from '@bemuse/music-collection/getPlayableCharts.js'
import type { MappingMode } from '@bemuse/rules/mapping-mode.js'
import type { Chart, SongMetadataInCollection } from '@mikuroxina/bemuse-types'
import { memo, type MouseEvent } from 'react'

import styles from './MusicListItem.module.scss'
import MusicListItemCharts from './MusicListItemCharts.js'

export interface MusicListItemProps {
  song: SongMetadataInCollection
  selected: boolean
  selectedChart?: Chart
  playMode: MappingMode
  onSelect: (
    e: MouseEvent<HTMLDivElement | HTMLLIElement>,
    song: Song,
    chart?: Chart
  ) => void
  highlight?: string
}

const ChartList = ({
  song,
  selectedChart,
  onClick,
}: {
  song: SongMetadataInCollection
  selectedChart?: Chart
  onClick: (chart: Chart, e: MouseEvent<HTMLDivElement>) => void
}) => (
  <MusicListItemCharts
    charts={getPlayableCharts(song.charts)}
    selectedChart={selectedChart}
    onChartClick={onClick}
  />
)

const Highlight = ({
  text,
  highlight,
}: {
  text: string
  highlight?: string
}) => {
  if (!highlight) {
    return <>{text}</>
  }

  const segments = text.toLowerCase().split(highlight.toLowerCase())
  if (segments.length === 1) {
    return <>{text}</>
  }

  const output = []
  let start = 0
  for (let i = 0; i < segments.length; i++) {
    output.push(text.substring(start, segments[i].length))
    start += segments[i].length
    if (i !== segments.length - 1) {
      const highlightedText = text.substring(start, highlight.length)
      output.push(<span className={styles.highlight}>{highlightedText}</span>)
      start += highlight.length
    }
  }
  return <>{output}</>
}

const MusicListItem = (props: MusicListItemProps) => {
  const { song, selected, onSelect, highlight } = props
  const handleClick = (e: MouseEvent<HTMLLIElement>) => {
    onSelect(e, song)
  }
  const handleChartClick = (chart: Chart, e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onSelect(e, song, chart)
  }

  return (
    <li
      className={styles.listItem}
      onClick={handleClick}
      data-active={selected}
      data-testid='music-list-item'
    >
      {song.tutorial ? (
        <div className={styles.tutorial}>
          <div className={styles.charts}>
            <ChartList onClick={handleChartClick} {...props} />
          </div>
          Tutorial
        </div>
      ) : (
        <div>
          <div className={styles.infoTop}>
            <div className={styles.title}>
              <Highlight text={song.title} highlight={highlight} />
            </div>
            <div className={styles.charts}>
              <ChartList onClick={handleChartClick} {...props} />
            </div>
          </div>
          <div className={styles.infoBottom}>
            <div className={styles.artist}>
              <Highlight text={song.artist} highlight={highlight} />
            </div>
            <div className={styles.genre}>
              <Highlight text={song.genre} highlight={highlight} />
            </div>
          </div>
        </div>
      )}
    </li>
  )
}

export default memo(MusicListItem)
