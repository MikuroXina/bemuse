import './MusicInfo.scss'

import type { Chart, Song } from '@bemuse/collection-model/types.js'
import type { MappingMode } from '@bemuse/rules/mapping-mode.js'

import MusicChartInfo from './MusicChartInfo.js'
import MusicChartSelector, {
  MusicChartSelectorProps,
} from './MusicChartSelector.js'
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
  <section className='MusicInfo'>
    {props.chart ? (
      <>
        <MusicChartInfo info={props.chart.info} />
        <MusicChartSelector
          song={props.song}
          selectedChart={props.chart}
          charts={props.charts}
          onChartClick={props.onChartClick}
        />
        <MusicInfoTabs {...props} chart={props.chart} />
      </>
    ) : (
      <></>
    )}
  </section>
)

export default MusicInfo
