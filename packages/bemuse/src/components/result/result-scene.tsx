import Scene from '@bemuse/components/common/scene.js'
import SceneHeading from '@bemuse/components/common/scene-heading.js'
import SceneToolbar, {
  SceneToolbarSpacer,
} from '@bemuse/components/common/scene-toolbar.js'
import RankingContainer from '@bemuse/components/ranking/ranking-container.js'
import type { MappingMode } from '@bemuse/rules/mapping-mode.js'
import { faTwitter } from '@fortawesome/free-brands-svg-icons/faTwitter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { Chart } from '@mikuroxina/bemuse-types'
import type { MouseEvent } from 'react'

import FirstTimeTip from '../../app/components/first-time-tip.js'
import MusicChartInfo from '../../app/components/music-chart-info.js'
import MusicChartSelectorItem from '../../app/components/music-chart-selector-item.js'
import * as QueryFlags from '../../app/query-flags.js'
import type { Result } from '../../app/types.js'
import ResultExpertInfo from './result-expert-info.js'
import ResultGrade from './result-grade.js'
import styles from './result-scene.module.scss'
import ResultTable from './result-table.js'

const getTweetLink = ({ chart, result }: { chart: Chart; result: Result }) => {
  const title = chart.info.title
  let subtitle = chart.info.subtitles[0] || ''
  const score = result.score
  const grade = result.grade
  if (subtitle === '') {
    const { genre } = chart.info
    const lastBraceStart = genre.lastIndexOf('[')
    if (genre.endsWith(']') && lastBraceStart !== -1) {
      subtitle = genre.substring(lastBraceStart + 1, genre.length - 1)
    }
  }
  subtitle = subtitle.trim()
  if (subtitle !== '' && !/^[[(]/.test(subtitle)) subtitle = `[${subtitle}]`
  if (subtitle !== '') subtitle = ` ${subtitle}`
  let url = 'https://bemuse.pages.dev/'
  const server = QueryFlags.getMusicServer()
  if (server) {
    url =
      (/^http:/.test(server) ? 'http' : 'https') +
      '://bemuse.pages.dev/?server=' +
      encodeURIComponent(server)
  }
  const text =
    `Played:「 ${title}${subtitle} 」on #Bemuse (Score:${score} [${grade}])` +
    '\n' +
    `→ ${url}`
  return (
    'https://twitter.com/intent/tweet?related=bemusegame&text=' +
    encodeURIComponent(text)
  )
}

export interface ResultSceneProps {
  result: Result
  playMode: MappingMode
  chart: Chart
  onReplay: () => void
  onExit: (e: MouseEvent) => void
}

const ResultScene = ({
  result,
  playMode,
  chart,
  onReplay,
  onExit,
}: ResultSceneProps) => {
  const onTweet = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(
      getTweetLink({ chart, result }),
      'intent',
      'width=550,height=420'
    )
  }

  return (
    <Scene className={styles.container}>
      <div data-testid='result-scene'>
        <SceneHeading className={styles.heading}>
          Play Result
          <div className={styles.mode}>
            {playMode === 'KB' ? 'Keyboard' : 'BMS'} Mode
          </div>
        </SceneHeading>
        <div className={styles.report}>
          <ResultTable result={result} />
        </div>
        <div className={styles.resultGrade}>
          <ResultGrade grade={result.grade} />
        </div>
        <div className={styles.information}>
          <div className={styles.informationHeader}>
            <div className={styles.chart}>
              <FirstTimeTip tip='Play again' featureKey='replayGame'>
                <div className={styles.selectorItem}>
                  <MusicChartSelectorItem
                    chart={chart}
                    onChartClick={onReplay}
                    isReplayable
                  />
                </div>
              </FirstTimeTip>
            </div>
            <div className={styles.chartInfo}>
              <MusicChartInfo info={chart.info} />
            </div>
          </div>
          <div className={styles.informationBody}>
            <RankingContainer
              result={result.tainted ? undefined : result}
              chart={chart}
              playMode={playMode}
            />
          </div>
          <div className={styles.informationFooter}>
            <a
              href={getTweetLink({ chart, result })}
              className={styles.tweet}
              onClick={onTweet}
            >
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <div className={styles.fillRest} />
            <FirstTimeTip tip='Back to music selection' featureKey='finishGame'>
              <div className={styles.exit} onClick={onExit}>
                Continue
              </div>
            </FirstTimeTip>
          </div>
        </div>
        <SceneToolbar>
          <span>
            <ResultExpertInfo deltas={result.deltas} />
          </span>
          <SceneToolbarSpacer />
          <a onClick={onExit}>Continue</a>
        </SceneToolbar>
      </div>
    </Scene>
  )
}

export default ResultScene
