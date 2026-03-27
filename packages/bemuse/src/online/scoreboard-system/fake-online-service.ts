import { isTestModeEnabled } from '@bemuse/debug/bemuse-test-mode.js'

import type {
  InternetRankingService,
  ScoreboardDataEntry,
  ScoreInfo,
  UserInfo,
} from '../index.js'
import type { RecordLevel } from '../level.js'
import { createFakeScoreboardClient } from './create-fake-scoreboard-client.js'
import type { ScoreboardClient, ScoreboardRow } from './scoreboard-client.js'

export class FakeOnlineService implements InternetRankingService {
  private playerToken: string | null = null
  private currentUser: UserInfo | null = null

  constructor(
    private readonly scoreboardClient: ScoreboardClient = createFakeScoreboardClient()
  ) {
    this.invalidateCurrentUser()
  }

  async invalidateCurrentUser() {
    if (this.playerToken == null) {
      return
    }
    const username = await this.scoreboardClient.myName(this.playerToken)
    this.currentUser = { username }
  }

  getCurrentUser() {
    return this.currentUser
  }

  isLoggedIn() {
    return !!this.currentUser
  }

  async logIn() {
    const { playerToken } = await this.scoreboardClient.login()
    this.playerToken = playerToken
    this.invalidateCurrentUser()
    return this.getCurrentUser()
  }

  async logOut() {
    this.playerToken = null
    this.invalidateCurrentUser()
  }

  async submitScore(info: ScoreInfo) {
    if (isTestModeEnabled()) {
      throw new Error('Cannot submit score in test mode')
    }
    if (!this.playerToken) {
      throw new Error('Not logged in')
    }

    const result = await this.scoreboardClient.submitScore({
      playerToken: this.playerToken,
      md5: info.md5,
      playMode: info.playMode,
      input: {
        score: info.score,
        combo: info.combo,
        count: info.count,
        total: info.total,
        log: info.log,
      },
    })
    const data = {
      md5: info.md5,
      playMode: info.playMode,
      ...toEntry(result.data.registerScore.resultingRow),
    }
    return data
  }

  // Retrieves a record.
  //
  // Returns a record object.
  async retrieveRecord(level: RecordLevel) {
    if (!this.playerToken) {
      throw new Error('Not logged in')
    }
    const result = await this.scoreboardClient.retrieveRecord({
      playerToken: this.playerToken,
      md5: level.md5,
      playMode: level.playMode,
    })
    const myRecord = result.data.chart.level.myRecord
    return (
      myRecord && {
        md5: level.md5,
        playMode: level.playMode,
        ...toEntry(myRecord),
      }
    )
  }

  // Retrieves the scoreboard
  async retrieveScoreboard({ md5, playMode }: RecordLevel) {
    const result = await this.scoreboardClient.retrieveScoreboard({
      md5,
      playMode,
    })
    return { data: result.data.chart.level.leaderboard.map(toEntry) }
  }

  // Retrieve multiple records!
  //
  // Items is an array of song items. They have a md5 property.
  async retrieveMultipleRecords(items: readonly { md5: string }[]) {
    if (!this.playerToken) {
      throw new Error('Not logged in')
    }
    const result = await this.scoreboardClient.retrieveRankingEntries({
      playerToken: this.playerToken,
      md5s: items.map((item) => item.md5),
    })
    const entries = result.data.me.records.map((item) => ({
      ...toEntry(item),
      md5: item.md5,
      playMode: item.playMode,
    }))
    return entries
  }
}

export default FakeOnlineService

function toEntry(row: ScoreboardRow): ScoreboardDataEntry {
  return {
    rank: row.rank,
    score: row.entry.score,
    combo: row.entry.combo,
    count: row.entry.count,
    total: row.entry.total,
    playerName: row.entry.player.name,
    recordedAt: new Date(row.entry.recordedAt),
    playCount: row.entry.playCount,
    playNumber: row.entry.playNumber,
  }
}
