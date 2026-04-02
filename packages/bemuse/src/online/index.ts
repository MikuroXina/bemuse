import type { ScoreCount } from '@bemuse/rules/accuracy.js'
import type { MappingMode } from '@bemuse/rules/mapping-mode.js'
import {
  useMutation,
  type UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'
import { useContext } from 'react'

import type { RecordLevel } from './level.js'
import { RankingServiceContext } from './service.js'

export interface UserInfo {
  username: string
}

export interface ScoreBase {
  score: number
  combo: number
  count: ScoreCount
  total: number
  log: string
}

export type ScoreInfo = ScoreBase & RecordLevel

export type RankingInfo = Partial<ScoreBase> & RecordLevel

export interface ScoreboardDataEntry {
  rank?: number
  score: number
  combo?: number
  count: ScoreCount
  total: number
  playerName: string
  recordedAt?: Date
  playCount?: number
  playNumber?: number
}

export type ScoreboardDataRecord = ScoreboardDataEntry & RecordLevel

export interface RankingService {
  isAuthenticated(): boolean
  me(): Promise<UserInfo | null>
  logIn(): Promise<UserInfo | null>
  logOut(): Promise<void>
  submitScore(scoreInfo: ScoreInfo): Promise<ScoreboardDataRecord>
  retrieveRecord(level: RecordLevel): Promise<ScoreboardDataRecord | null>
  retrieveScoreboard(
    level: RecordLevel
  ): Promise<{ data: ScoreboardDataEntry[] }>
}

export const useCurrentUser = (): UserInfo | null => {
  const service = useContext(RankingServiceContext)
  const { data } = useQuery({
    enabled: service.isAuthenticated(),
    queryKey: ['online', 'me'],
    queryFn: () => service.me(),
  })
  return data ?? null
}

export const useLogInMutation = (): UseMutationResult<
  UserInfo | null,
  Error,
  never[]
> => {
  const service = useContext(RankingServiceContext)
  const client = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const user = await service.logIn()
      client.setQueryData(['online', 'me'], user)
      await client.invalidateQueries({
        queryKey: ['online', 'record'],
        type: 'all',
      })
      return user
    },
  })
}

export const useLogOutMutation = (): UseMutationResult<
  void,
  Error,
  never[]
> => {
  const service = useContext(RankingServiceContext)
  const client = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await service.logOut()
      client.setQueryData(['online', 'me'], null)
      client.setQueriesData(
        {
          queryKey: ['online', 'record'],
          type: 'all',
        },
        null
      )
    },
  })
}

export function useLeaderboardQuery(
  chart: { md5: string },
  playMode: MappingMode
): UseQueryResult<{ data: ScoreboardDataEntry[] }> {
  const service = useContext(RankingServiceContext)
  return useQuery({
    queryKey: ['online', 'leaderboard', chart.md5, playMode],
    queryFn: () => service.retrieveScoreboard({ md5: chart.md5, playMode }),
  })
}

export function useRecordQuery(
  chart: { md5: string },
  playMode: MappingMode
): UseQueryResult<ScoreboardDataRecord | null> {
  const service = useContext(RankingServiceContext)
  return useQuery({
    enabled: service.isAuthenticated(),
    queryKey: ['online', 'record', chart.md5, playMode],
    queryFn: () => service.retrieveRecord({ md5: chart.md5, playMode }),
  })
}

export function useSubmitMutation(): UseMutationResult<
  ScoreboardDataRecord,
  unknown,
  ScoreInfo
> {
  const service = useContext(RankingServiceContext)
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (info: ScoreInfo) => {
      return await service.submitScore(info)
    },
    onSuccess: (data, info) => {
      client.setQueryData(['online', 'record', info.md5, info.playMode], data)
      client.invalidateQueries({
        queryKey: ['online', 'leaderboard', info.md5, info.playMode],
      })
    },
  })
}
