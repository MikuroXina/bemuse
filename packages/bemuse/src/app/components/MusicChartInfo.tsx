import type { Chart } from '@mikuroxina/bemuse-types'

import styles from './MusicChartInfo.module.scss'

const MusicChartInfo = ({ info }: Pick<Chart, 'info'>) => (
  <section className={styles.info}>
    <div className={styles.genre}>{info.genre}</div>
    <div className={styles.title}>{info.title}</div>
    {info.subtitles.map((text, index) => (
      <div className={styles.subtitle} key={index}>
        {text}
      </div>
    ))}
    <div className={styles.artist}>
      {info.artist}
      {info.subartists.length ? (
        <small>{' · ' + info.subartists.join(' · ')}</small>
      ) : null}
    </div>
  </section>
)

export default MusicChartInfo
