import type { ScoreCount } from '@bemuse/rules/accuracy.js'
import type { MappingMode } from '@bemuse/rules/mapping-mode.js'

export interface ScoreboardClient {
  login(): Promise<{
    playerToken: string
  }>

  myName(playerToken: string): Promise<string>

  submitScore(options: {
    playerToken: string
    md5: string
    playMode: MappingMode
    input: SubmitScoreInput
  }): Promise<{
    data: {
      registerScore: {
        resultingRow: ScoreboardRow
      }
    }
  }>

  retrieveScoreboard(options: { md5: string; playMode: string }): Promise<{
    data: {
      chart: {
        level: {
          leaderboard: ScoreboardRow[]
        }
      }
    }
  }>

  retrieveRecord(options: {
    playerToken: string
    md5: string
    playMode: string
  }): Promise<{
    data: {
      chart: {
        level: {
          myRecord: ScoreboardRow | null
        }
      }
    }
  }>

  retrieveRankingEntries(options: {
    playerToken: string
    md5s: string[]
  }): Promise<{
    data: {
      me: {
        records: {
          md5: string
          playMode: MappingMode
          entry: ScoreboardEntry
        }[]
      }
    }
  }>
}

export interface SubmitScoreInput {
  score: number
  combo: number
  count: ScoreCount
  log: string
  total: number
}

export interface ScoreboardRow {
  rank?: number
  entry: ScoreboardEntry
}

export interface ScoreboardEntry {
  id: string
  score: number
  total: number
  combo: number
  count: ScoreCount
  playNumber: number
  playCount: number
  recordedAt: string
  player: {
    name: string
  }
}
