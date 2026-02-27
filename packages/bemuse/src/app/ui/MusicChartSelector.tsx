import type { Chart, SongMetadata } from '@mikuroxina/bemuse-types'

import styles from './MusicChartSelector.module.scss'
import MusicChartSelectorItem, {
  type MusicChartSelectorItemProps,
} from './MusicChartSelectorItem.js'

export interface MusicChartSelectorProps {
  charts: readonly Chart[]
  song: SongMetadata
  selectedChart: Chart
  onChartClick: MusicChartSelectorItemProps['onChartClick']
}

const MusicChartSelector = ({
  charts,
  song,
  selectedChart,
  onChartClick,
}: MusicChartSelectorProps) => (
  <ul className={styles.container} data-tutorial={!!song.tutorial}>
    {charts.map((chart, index) => (
      <MusicChartSelectorItem
        key={index}
        chart={chart}
        isTutorial={!!song.tutorial}
        isSelected={chart.md5 === selectedChart.md5}
        onChartClick={onChartClick}
      />
    ))}
  </ul>
)

export default MusicChartSelector
