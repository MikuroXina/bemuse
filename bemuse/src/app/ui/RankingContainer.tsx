import { isQueryFlagEnabled } from '@bemuse/flags/index.js'
import {
  useCurrentUser,
  useLeaderboardQuery,
  usePersonalRankingEntryQuery,
  useRecordSubmissionMutation,
} from '@bemuse/online/hooks.js'
import { RankingState, RankingStream } from '@bemuse/online/index.js'
import { OnlineContext } from '@bemuse/online/instance.js'
import {
  completed,
  error,
  loading,
  Operation,
} from '@bemuse/online/operations.js'
import { ScoreCount } from '@bemuse/rules/accuracy.js'
import { MappingMode } from '@bemuse/rules/mapping-mode.js'
import { useContext, useEffect, useRef, useState } from 'react'
import { UseMutationResult, UseQueryResult } from 'react-query'

import Ranking from './Ranking.js'
import { Result } from './ResultScene.js'

export interface RankingContainerProps {
  chart: { md5: string }
  playMode: MappingMode
  result?: Result
}

/** @deprecated */
export const OldRankingContainer = ({
  chart,
  playMode,
  result,
}: RankingContainerProps) => {
  const online = useContext(OnlineContext)
  const [state, setState] = useState<RankingState>({
    data: null,
    meta: {
      scoreboard: { status: 'loading' },
      submission: { status: 'loading' },
    },
  })
  const model = useRef<RankingStream | null>(null)
  useEffect(() => {
    const onStoreTrigger = (newState: RankingState) =>
      setState(() => ({ ...newState }))
    const params = {
      md5: chart.md5,
      playMode: playMode,
      ...(result
        ? {
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
          }
        : {}),
    }
    model.current = online.Ranking(params)
    const subscription = model.current.state川.subscribe(onStoreTrigger)
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const onReloadScoreboardRequest = () => {
    model.current?.reloadScoreboard()
  }

  const onResubmitScoreRequest = () => {
    model.current?.resubmit()
  }

  return (
    <Ranking
      state={state}
      onReloadScoreboardRequest={onReloadScoreboardRequest}
      onResubmitScoreRequest={onResubmitScoreRequest}
    />
  )
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
        ? operationFromResult(
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

function operationFromResult<T>(
  result: UseMutationResult<T> | UseQueryResult<T>
): Operation<T> {
  if (result.isLoading) {
    return loading()
  }
  if (result.isError) {
    return error(result.error as Error)
  }
  return completed(result.data!)
}

export default isQueryFlagEnabled('old-ranking')
  ? OldRankingContainer
  : NewRankingContainer
