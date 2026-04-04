import type { Chart, Song } from '@bemuse/collection-model/types.js'
import type { MappingMode } from '@bemuse/rules/mapping-mode.js'
import { memo } from 'react'

import MusicChartInfo from './music-chart-info.js'
import MusicChartSelector from './music-chart-selector.js'
import styles from './music-info.module.scss'
import MusicInfoTabs from './music-info-tabs.js'

export interface MusicInfoProps {
  chart?: Chart
  charts: readonly Chart[]
  onChartClick: (chart: Chart) => void
  onOptions: () => void
  playMode: MappingMode
  song: Song
  serverUrl: string
}

const MusicInfo = (props: MusicInfoProps) => (
  <section className={styles.container}>
    {props.chart && (
      <>
        <div className={styles.chartInfo}>
          <MusicChartInfo key={props.chart.md5} info={props.chart.info} />
        </div>
        <div className={styles.chartSelector}>
          <MusicChartSelector
            song={props.song}
            selectedChart={props.chart}
            charts={props.charts}
            onChartClick={props.onChartClick}
          />
        </div>
        <MusicInfoTabs {...props} chart={props.chart} />
      </>
    )}
  </section>
)

export default memo(MusicInfo)
