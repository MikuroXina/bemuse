import type { MappingMode } from '@bemuse/rules/mapping-mode.js'
import type { QueryKey } from '@tanstack/react-query'

export const getPersonalRecordQueryKey = (md5: string, playMode: MappingMode) =>
  ['online', 'personalRecord', md5, playMode] as const

export const getLeaderboardQueryKey: (
  md5: string,
  playMode: MappingMode
) => QueryKey = (md5, playMode) => ['online', 'leaderboard', md5, playMode]

export const getPersonalRankingEntryQueryKey: (
  md5: string,
  playMode: MappingMode
) => QueryKey = (md5, playMode) => [
  'online',
  'personalRankingEntry',
  md5,
  playMode,
]
