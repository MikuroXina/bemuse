import type { ScoreCount } from '@bemuse/rules/accuracy.js'
import { useState } from 'react'

import type { RecordLevel } from './level.js'
import type { Operation } from './operations.js'

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

export const useOnline = (service: InternetRankingService): Online => {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null)
  return {
    getCurrentUser: () => currentUser,
    logIn: async () => {
      const user = await service.logIn()
      setCurrentUser(user)
      return user
    },
    getPersonalRecord: async (level) => {
      if (!service.getCurrentUser()) {
        return null
      }
      return await service.retrieveRecord(level)
    },
    logOut: async () => {
      setCurrentUser(null)
      await service.logOut()
    },
    submitScore: async (scoreInfo) => {
      if (!currentUser) {
        throw new Error('unauthorized')
      }
      return await service.submitScore(scoreInfo)
    },
    scoreboard: (level) => service.retrieveScoreboard(level),
    retrievePersonalRankingEntry: async (level: RecordLevel) => {
      if (!currentUser) {
        return null
      }
      return await service.retrieveRecord(level)
    },
  }
}

export interface Online {
  getCurrentUser(): UserInfo | null
  logIn(): Promise<UserInfo | null>
  getPersonalRecord(level: RecordLevel): Promise<ScoreboardDataRecord | null>
  logOut(): Promise<void>
  submitScore(info: ScoreInfo): Promise<ScoreboardDataRecord>
  scoreboard(level: RecordLevel): Promise<{ data: ScoreboardDataEntry[] }>
  retrievePersonalRankingEntry(
    level: RecordLevel
  ): Promise<ScoreboardDataRecord | null>
}
