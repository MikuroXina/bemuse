import { queryClient } from '@bemuse/react-query/index.js'
import type { ScoreCount } from '@bemuse/rules/accuracy.js'

import type { RecordLevel } from './level.js'
import type { Operation } from './operations.js'
import { rootQueryKey } from './query-keys.js'

const STORAGE_KEY = 'scoreboard.auth.access-token'

export const storeAccessToken = (accessToken: string) => {
  localStorage.setItem(STORAGE_KEY, accessToken)
}

export const clearAccessToken = () => {
  localStorage.removeItem(STORAGE_KEY)
}

export const loadAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEY)
}

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

export interface InternetRankingService {
  getCurrentUser(): UserInfo | null
  logIn(): Promise<UserInfo | null>
  logOut(): Promise<void>
  submitScore(scoreInfo: ScoreInfo): Promise<ScoreboardDataRecord>
  retrieveRecord(level: RecordLevel): Promise<ScoreboardDataRecord | null>
  retrieveScoreboard(
    level: RecordLevel
  ): Promise<{ data: ScoreboardDataEntry[] }>
}

export class Online {
  constructor(private readonly service: InternetRankingService) {}

  getCurrentUser() {
    return this.service.getCurrentUser()
  }

  async logIn() {
    const user = await this.service.logIn()
    queryClient.invalidateQueries({ queryKey: [this, rootQueryKey] })
    return user
  }

  async getPersonalRecord(
    level: RecordLevel
  ): Promise<ScoreboardDataRecord | null> {
    if (!this.service.getCurrentUser()) {
      return null
    }
    return await this.service.retrieveRecord(level)
  }

  async logOut(): Promise<void> {
    await this.service.logOut()
    queryClient.invalidateQueries({ queryKey: [this, rootQueryKey] })
  }

  async submitScore(info: ScoreInfo) {
    if (!this.service.getCurrentUser()) {
      throw new Error('Unauthenticated.')
    }
    const record = await this.service.submitScore(info)
    return record
  }

  async scoreboard(level: RecordLevel) {
    return await this.service.retrieveScoreboard(level)
  }

  async retrievePersonalRankingEntry(level: RecordLevel) {
    if (!this.service.getCurrentUser()) {
      return null
    }
    return await this.service.retrieveRecord(level)
  }

  dispose() {}
}

export default Online
