import { Icon } from '@bemuse/fa/index.js'
import type { Chart } from '@mikuroxina/bemuse-types'

import styles from './MusicChartSelectorItem.module.scss'

const Text = ({
  isTutorial,
  chart,
}: {
  isTutorial?: boolean
  chart: Chart
}) => {
  if (isTutorial) {
    const gameMode = chart.keys === '5K' ? '5 keys' : '7 keys'
    return <>{`Start Tutorial (${gameMode})`}</>
  }
  return <span className={styles.level}>{chart.info.level}</span>
}

export interface MusicChartSelectorItemProps {
  chart: Chart
  isSelected?: boolean
  isReplayable?: boolean
  isTutorial?: boolean
  onChartClick: (chart: Chart, e: React.MouseEvent<HTMLLIElement>) => void
}

const MusicChartSelectorItem = ({
  chart,
  isSelected,
  isReplayable,
  isTutorial,
  onChartClick,
}: MusicChartSelectorItemProps) => {
  const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
    onChartClick(chart, e)
  }

  return (
    <li
      className={styles.selectorItem}
      onClick={handleClick}
      data-active={isSelected}
      data-tutorial={isTutorial}
      data-replayable={isReplayable}
      data-keys={chart.keys}
      data-insane={chart.info.difficulty >= 5}
      data-testid={isSelected ? 'play-selected-chart' : undefined}
    >
      <Text isTutorial={isTutorial} chart={chart} />
      <span className={styles.play}>
        <Icon name='play' />
      </span>
    </li>
  )
}

export default MusicChartSelectorItem
