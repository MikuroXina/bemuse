import { inspect } from 'node:util'

import type { Song } from '@bemuse/collection-model/types.js'
import getPlayableCharts from '@bemuse/music-collection/getPlayableCharts.js'
import getPreviewResourceUrl from '@bemuse/music-collection/getPreviewResourceUrl.js'
import groupSongsIntoCategories from '@bemuse/music-collection/groupSongsIntoCategories.js'
import sortSongs from '@bemuse/music-collection/sortSongs.js'
import { useMusicPreviewer } from '@bemuse/music-previewer/hook.js'
import { useState } from 'react'

import styles from './MusicTable.module.css'

type Sorter = (songs: readonly Song[]) => {
  title: string
  songs: Song[]
}[]

const sorters: Record<string, Sorter> = {
  ingame: (songs: readonly Song[]) =>
    groupSongsIntoCategories(sortSongs(songs)),
  added: (songs: readonly Song[]) => [
    {
      title: 'Sorted by added date',
      songs: songs.toSorted((a, b) => {
        const aAdded = getAdded(a)
        const bAdded = getAdded(b)
        if (aAdded < bAdded) {
          return 1
        }
        if (aAdded > bAdded) {
          return -1
        }
        return 0
      }),
    },
  ],
}

const getAdded = (song: Song) =>
  song.added || (song.initial ? '0000-00-00' : '9999-99-99')

interface Problem {
  keys: readonly string[]
  message: string
}

function validateSong(song: Song): Problem[] {
  const problems: Problem[] = []
  const report = (message: string, ...keys: string[]) =>
    problems.push({ keys, message })
  if (song.unreleased) {
    report('Not released', 'unreleased')
  }
  if (!song.readme) {
    report('No README file found', 'README.md')
  }
  if (!song.replaygain) {
    report('No replay gain', 'replaygain')
  }
  if (!song.artist_url) {
    report('No artist URL', 'artist_url')
  }
  if (!song.added && !song.initial) {
    report('No added date', 'added')
  }
  if (!song.song_url && !song.youtube_url && !song.long_url) {
    report('No song/YouTube/long URL', 'song_url', 'long_url', 'youtube_url')
  }
  if (!song.bms_url && !song.exclusive) {
    report('No download URL', 'bms_url')
  }
  if (!song.bmssearch_id && !song.exclusive) {
    report('No BMS search ID', 'bmssearch_id')
  }
  if (!song.charts.filter((chart) => chart.keys === '5K').length) {
    report('No 5-key charts', '5key')
  }
  for (const chart of getPlayableCharts(song.charts)) {
    if (!chart.info.subtitles.length) {
      report('Missing subtitle', 'chart_names ' + chart.file)
    }
  }
  return problems
}

const SongWarnings = ({ song }: { song: Song }) => {
  const problems = validateSong(song)
  if (!problems.length) return null
  return (
    <div>
      {problems.map((problem, index) => (
        <div key={index}>
          {problem.keys.map((key) => (
            <code key={key} className={styles.warning}>
              {key}
            </code>
          ))}
          {problem.message}
        </div>
      ))}
    </div>
  )
}
const SongRow = ({
  song,
  onClick,
}: {
  song: Song
  onClick: () => void
}): JSX.Element => (
  <tr key={song.id}>
    <td>
      <strong
        onClick={() => {
          prompt('', `vim '${song.id}/README.md'`)
        }}
      >
        <code className={styles.songId}>{song.id}</code>
      </strong>
      <br />
      <span className={styles.subLabel}>{song.added}</span>
    </td>
    <td className={styles.songInfo}>
      <span className={styles.subLabel} onClick={onClick}>
        {song.genre}
      </span>
      <br />
      <strong
        onClick={() => {
          console.log(song)
          alert(inspect(song))
        }}
      >
        {song.title}
      </strong>
      <br />
      {song.artist}
    </td>
    <td>
      <SongWarnings song={song} />
    </td>
  </tr>
)

const Rows = ({
  sort,
  songs,
  onClickRow,
}: {
  sort: string
  songs: readonly Song[]
  url: string
  onClickRow: (song: Song) => void
}) => {
  const categories = sorters[sort](songs)
  return categories.map((category) => (
    <>
      <tr key={category.title}>
        <th colSpan={4}>{category.title}</th>
      </tr>
      {category.songs.map((song) => (
        <SongRow
          key={song.id}
          {...{
            song,
            onClick: () => {
              onClickRow(song)
            },
          }}
        />
      ))}
    </>
  ))
}

const Preview = ({
  previewEnabled,
  togglePreview,
}: {
  previewEnabled: boolean
  togglePreview: () => void
}) => (
  <span>
    <strong>Music preview:</strong>
    <button onClick={togglePreview}>
      {previewEnabled ? 'disable' : 'enable'}
    </button>
  </span>
)

const Sorter = ({ setSort }: { setSort: (key: string) => void }) => (
  <span>
    <strong>Sort by:</strong>{' '}
    {Object.keys(sorters).map((key) => (
      <button key={key} onClick={() => setSort(key)}>
        {key}
      </button>
    ))}
  </span>
)

const Table = ({
  data,
  url,
  initialSort,
}: {
  data: { songs: readonly Song[] }
  url: string
  initialSort: string
}) => {
  const [sort, setSort] = useState(initialSort || Object.keys(sorters)[0])
  const [previewEnabled, setPreviewEnabled] = useState(false)
  const previewer = useMusicPreviewer()

  async function onClickRow(song: Song) {
    const previewUrl = await getPreviewResourceUrl(song, url)
    if (previewUrl) {
      previewer.preview(previewUrl)
    }
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th colSpan={4}>
            <Sorter setSort={setSort} />
            {' · '}
            <Preview
              previewEnabled={previewEnabled}
              togglePreview={() => setPreviewEnabled((flag) => !flag)}
            />
          </th>
        </tr>
        <tr>
          <th>id</th>
          <th>song</th>
          <th>warnings</th>
        </tr>
      </thead>
      <tbody>
        <Rows
          sort={sort}
          songs={data.songs}
          url={url}
          onClickRow={onClickRow}
        />
      </tbody>
    </table>
  )
}

const Message = ({ text }: { text: string }) => (
  <div className={styles.message}>{text}</div>
)

export interface MusicTableProps {
  data: { songs: readonly Song[] } | null
  url: string
  initialSort: string
}

export const MusicTable = ({ data, url, initialSort }: MusicTableProps) => {
  if (!data) return <Message text='No data' />
  try {
    return <Table data={data} url={url} initialSort={initialSort} />
  } catch (e) {
    return <Message text={`Error: ${e}`} />
  }
}

export default MusicTable
