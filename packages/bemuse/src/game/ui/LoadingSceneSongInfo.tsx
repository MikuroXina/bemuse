import { isTitleDisplayMode } from '@bemuse/flags/index.js'

import styles from './LoadingSceneSongInfo.module.scss'

export interface LoadingSceneSongInfoProps {
  song: {
    title: string
    artist: string
    genre: string
    subtitles: readonly string[]
    subartists: readonly string[]
    difficulty: number
    level: number
  }
}

const LoadingSceneSongInfo = ({ song }: LoadingSceneSongInfoProps) => (
  <div className={styles.container}>
    <div className={styles.genre}>{song.genre}</div>
    <div className={styles.title}>{song.title}</div>
    {!isTitleDisplayMode()
      ? song.subtitles.map((text) => (
          <div key={text} className={styles.subtitle}>
            {text}
          </div>
        ))
      : null}
    <div className={styles.artist}>{song.artist}</div>
    {song.subartists.map((text) => (
      <div key={text} className={styles.subartist}>
        {text}
      </div>
    ))}
  </div>
)
export default LoadingSceneSongInfo
