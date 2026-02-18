import './MusicInfo.scss'

import { Chart, Song } from '@bemuse/collection-model/types'
import { MappingMode } from '@bemuse/rules/mapping-mode'
import React from 'react'

import MusicChartInfo from './MusicChartInfo'
import MusicChartSelector, {
  MusicChartSelectorProps,
} from './MusicChartSelector'
import MusicInfoTabs from './MusicInfoTabs'

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
