import {
  useCurrentUser,
  useLeaderboardQuery,
  usePersonalRankingEntryQuery,
  useRecordSubmissionMutation,
} from '@bemuse/online/hooks.js'
import type {
  RankingState,
  ScoreboardDataRecord,
  ScoreInfo,
} from '@bemuse/online/index.js'
import {
  completed,
  error,
  loading,
  type Operation,
} from '@bemuse/online/operations.js'
import type { ScoreCount } from '@bemuse/rules/accuracy.js'
import type { MappingMode } from '@bemuse/rules/mapping-mode.js'
import { useEffect, useRef } from 'react'
import type { UseMutationResult, UseQueryResult } from 'react-query'

import type { Result } from '../../app/types.js'
import Ranking from './Ranking.js'

export interface RankingContainerProps {
  chart: { md5: string }
  playMode: MappingMode
  result?: Result
}

export const NewRankingContainer = ({
  chart,
  playMode,
  result,
}: RankingContainerProps) => {
  const user = useCurrentUser()
  const leaderboardQuery = useLeaderboardQuery(chart, playMode)
  const personalRankingEntryQuery = usePersonalRankingEntryQuery(
    chart,
    playMode
  )
  const submissionMutation = useRecordSubmissionMutation()
  const canSubmit = !!user && !!result
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
  const state: RankingState = {
    data: leaderboardQuery.data?.data || null,
    meta: {
      submission: user
        ? operationFromResult<ScoreboardDataRecord | null, unknown, ScoreInfo>(
            canSubmit ? submissionMutation : personalRankingEntryQuery
          )
        : { status: 'unauthenticated' },
      scoreboard: operationFromResult(leaderboardQuery),
    },
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
      state={state}
      onReloadScoreboardRequest={() => personalRankingEntryQuery.refetch()}
      onResubmitScoreRequest={submit}
    />
  )
}

function operationFromResult<T, TError, TVariables>(
  result: UseMutationResult<T, TError, TVariables> | UseQueryResult<T, TError>
): Operation<T> {
  if (result.isLoading) {
    return loading()
  }
  if (result.isError) {
    return error(result.error as Error)
  }
  return completed(result.data!)
}

export default NewRankingContainer
