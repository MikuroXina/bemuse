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
import type { Operation } from './operations.js'
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

export type SubmissionOperation =
  | Operation<ScoreboardDataEntry | null>
  | Readonly<{
      status: 'unauthenticated'
    }>

export interface RankingState {
  data: ScoreboardDataEntry[] | null
  meta: {
    submission: SubmissionOperation
    scoreboard: Operation<{ data: ScoreboardDataEntry[] }>
  }
}

export interface RankingService {
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
    queryKey: [service, 'me'],
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
  return useMutation({
    mutationKey: [service, 'login'],
    mutationFn: () => service.logIn(),
  })
}

export const useLogOutMutation = (): UseMutationResult<
  void,
  Error,
  never[]
> => {
  const service = useContext(RankingServiceContext)
  return useMutation({
    mutationKey: [service, 'logout'],
    mutationFn: () => service.logOut(),
  })
}

export function useLeaderboardQuery(
  chart: { md5: string },
  playMode: MappingMode
): UseQueryResult<{ data: ScoreboardDataEntry[] }> {
  const service = useContext(RankingServiceContext)
  return useQuery({
    queryKey: [service, 'leaderboard', chart.md5, playMode],
    queryFn: () => service.retrieveScoreboard({ md5: chart.md5, playMode }),
  })
}

export function useRecordQuery(
  chart: { md5: string },
  playMode: MappingMode
): UseQueryResult<ScoreboardDataRecord | null> {
  const service = useContext(RankingServiceContext)
  return useQuery({
    queryKey: [service, 'record', chart.md5, playMode],
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
      client.setQueryData([service, 'record', info.md5, info.playMode], data)
      client.invalidateQueries({
        queryKey: [service, 'leaderboard', info.md5, info.playMode],
      })
    },
  })
}
