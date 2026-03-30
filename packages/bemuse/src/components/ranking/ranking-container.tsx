import { useCurrentUser, useSubmitMutation } from '@bemuse/online/index.js'
import type { ScoreCount } from '@bemuse/rules/accuracy.js'
import type { MappingMode } from '@bemuse/rules/mapping-mode.js'
import { useEffect, useRef } from 'react'

import type { Result } from '../../app/types.js'
import Ranking from './ranking.js'

export interface RankingContainerProps {
  chart: { md5: string }
  playMode: MappingMode
  result?: Result
}

const RankingContainer = ({
  chart,
  playMode,
  result,
}: RankingContainerProps) => {
  const user = useCurrentUser()
  const submissionMutation = useSubmitMutation()
  const canSubmit = !!user && !!result && !result.tainted
  const submit = () => {
    if (canSubmit) {
      submissionMutation.mutate({
        md5: chart.md5,
        playMode: playMode,
        score: result.score,
        combo: result.maxCombo,
        total: result.totalCombo,
        count: [
          result['1'],
          result['2'],
          result['3'],
          result['4'],
          result.missed,
        ] as ScoreCount,
        log: result.log,
      })
    }
  }
  const submitted = useRef(false)
  useEffect(() => {
    if (!submitted.current && canSubmit) {
      submitted.current = true
      submit()
    }
  }, [canSubmit])
  return (
    <Ranking
      onResubmitScoreRequest={submit}
      chartMd5={chart.md5}
      playMode={playMode}
    />
  )
}

export default RankingContainer
