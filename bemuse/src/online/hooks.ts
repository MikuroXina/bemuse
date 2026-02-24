import type { MappingMode } from '@bemuse/rules/mapping-mode.js'
import { useContext } from 'react'
import {
  useMutation,
  type UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from 'react-query'

import type {
  ScoreboardDataEntry,
  ScoreboardDataRecord,
  ScoreInfo,
} from './index.js'
import { OnlineContext } from './instance.js'
import {
  currentUserQueryKey,
  getLeaderboardQueryKey,
  getPersonalRankingEntryQueryKey,
  getPersonalRecordQueryKey,
} from './queryKeys.js'

export function useCurrentUser() {
  const online = useContext(OnlineContext)
  return (
    useQuery({
      queryKey: currentUserQueryKey,
      queryFn: () => online.getCurrentUser(),
    }).data || null
  )
}

export function usePersonalRecordsByMd5Query(chart: { md5: string }) {
  const online = useContext(OnlineContext)
  return useQuery({
    queryKey: getPersonalRecordQueryKey(chart.md5),
    queryFn: () => online.getPersonalRecordsByMd5(chart.md5),
  })
}

export function useLeaderboardQuery(
  chart: { md5: string },
  playMode: MappingMode
): UseQueryResult<{ data: ScoreboardDataEntry[] }> {
  const online = useContext(OnlineContext)
  return useQuery({
    queryKey: getLeaderboardQueryKey(chart.md5, playMode),
    queryFn: () => online.scoreboard({ md5: chart.md5, playMode }),
  })
}

export function usePersonalRankingEntryQuery(
  chart: { md5: string },
  playMode: MappingMode
): UseQueryResult<ScoreboardDataRecord | null> {
  const online = useContext(OnlineContext)
  return useQuery({
    queryKey: getPersonalRankingEntryQueryKey(chart.md5, playMode),
    queryFn: () =>
      online.retrievePersonalRankingEntry({ md5: chart.md5, playMode }),
  })
}

export function useRecordSubmissionMutation(): UseMutationResult<
  ScoreboardDataRecord,
  unknown,
  ScoreInfo
> {
  const online = useContext(OnlineContext)
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (info: ScoreInfo) => {
      return await online.submitScore(info)
    },
    onSuccess: (data, info) => {
      client.setQueryData(
        getPersonalRankingEntryQueryKey(info.md5, info.playMode),
        data
      )
      client.invalidateQueries({
        queryKey: getLeaderboardQueryKey(info.md5, info.playMode),
      })
    },
  })
}
