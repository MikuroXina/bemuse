import type { Chart, Song } from '@bemuse/collection-model/types.js'
import RankingContainer from '@bemuse/components/ranking/RankingContainer.js'
import { Icon } from '@bemuse/fa/index.js'
import type { MappingMode } from '@bemuse/rules/mapping-mode.js'
import { useState } from 'react'

import MusicInfoTabInformation from './MusicInfoTabInformation.js'
import styles from './MusicInfoTabs.module.scss'
import MusicInfoTabStats from './MusicInfoTabStats.js'

export interface MusicInfoTabsProps {
  chart: Chart
  onOptions: () => void
  playMode: MappingMode
  song: Song
}

const TABS = ['Stats', 'Ranking', 'Information'] as const

const MusicInfoTab = ({
  isActive,
  title,
  onClick,
}: {
  isActive: boolean
  title: string
  onClick: () => void
}) => {
  return (
    <li className={styles.tab} onClick={onClick} data-active={isActive}>
      {title}
    </li>
  )
}

const MusicInfoPanel = ({
  selectedTab,
  song,
  chart,
  playMode,
}: {
  selectedTab: keyof typeof TABS
  song: Song
  chart: Chart
  playMode: MappingMode
}) => {
  switch (selectedTab) {
    case 0:
      return <MusicInfoTabStats chart={chart} />
    case 1:
      return <RankingContainer chart={chart} playMode={playMode} />
    case 2:
      return <MusicInfoTabInformation song={song} />
    default:
      return <>Unknown tab</>
  }
}

const MusicInfoTabs = (props: MusicInfoTabsProps) => {
  const [selectedTab, setSelectedTab] = useState(0)
  const onClick = (index: number) => () => setSelectedTab(index)
  return (
    <section className={styles.bg}>
      <ul className={styles.tabs}>
        <li
          className={styles.options}
          onClick={props.onOptions}
          data-testid='options-button'
        >
          <Icon name='gear' /> Options
        </li>
        {TABS.map((title, index) => (
          <MusicInfoTab
            key={index}
            isActive={selectedTab === index}
            title={title}
            onClick={onClick(index)}
          />
        ))}
      </ul>
      <div className={styles.panel} data-selected={selectedTab}>
        <MusicInfoPanel selectedTab={selectedTab} {...props} />
      </div>
    </section>
  )
}

export default MusicInfoTabs
