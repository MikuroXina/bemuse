import type { Chart, Song } from '@bemuse/collection-model/types.js'
import type { MappingMode } from '@bemuse/rules/mapping-mode.js'

import MusicChartInfo from './MusicChartInfo.js'
import MusicChartSelector, {
  type MusicChartSelectorProps,
} from './MusicChartSelector.js'
import styles from './MusicInfo.module.scss'
import MusicInfoTabs from './MusicInfoTabs.js'

export interface MusicInfoProps {
  chart?: Chart
  charts: readonly Chart[]
  onChartClick: MusicChartSelectorProps['onChartClick']
  onOptions: () => void
  playMode: MappingMode
  song: Song
}

const MusicInfo = (props: MusicInfoProps) => (
  <section className={styles.container}>
    {props.chart ? (
      <>
        <div className={styles.chartInfo}>
          <MusicChartInfo info={props.chart.info} />
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
    ) : (
      <></>
    )}
  </section>
)

export default MusicInfo
