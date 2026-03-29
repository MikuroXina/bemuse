import { Auth, Scoreboard } from '@mikuroxina/scoreboard-types'
import { type InferOutput, parse } from 'valibot'

import {
  type RankingService,
  type ScoreboardDataEntry,
  type ScoreboardDataRecord,
  type ScoreInfo,
  type UserInfo,
} from '../index.js'
import type { RecordLevel } from '../level.js'

const STORAGE_KEY = 'scoreboard.auth.access-token'

export const storeAccessToken = (accessToken: string) => {
  localStorage.setItem(STORAGE_KEY, accessToken)
}

const clearAccessToken = () => {
  localStorage.removeItem(STORAGE_KEY)
}

const loadAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEY)
}

export class MXOnlineService implements RankingService {
  #currentUser: Auth.UserInfo | null = null

  constructor(private readonly baseUrl: string) {}

  isAuthenticated(): boolean {
    return this.#currentUser != null
  }

  /**
   * Checks the token has expired, and then clears it if it has expired.
   *
   * @returns Whether the user is needed to login wih the login mode popup.
   */
  private async invalidateToken(): Promise<boolean> {
    const accessToken = loadAccessToken()
    if (accessToken == null) {
      return true
    }

    const res = await fetch(new URL('/api/v1/auth/users/me', this.baseUrl), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    if (res.status === 401) {
      clearAccessToken()
      return true
    }
    return false
  }

  private popupLoginMode(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      window.addEventListener(
        'message',
        () => {
          resolve()
        },
        { once: true }
      )
      const popup = window.open(
        new URL('/?mode=login', location.origin),
        'login',
        'width=640,height=360'
      )
      if (popup == null) {
        reject(new Error('failed to open popup'))
      }
    })
  }

  async me(): Promise<UserInfo | null> {
    const accessToken = loadAccessToken()
    const res = await fetch(new URL('/api/v1/auth/users/me', this.baseUrl), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    if (!res.ok) {
      console.log(await res.text())
      return null
    }
    this.#currentUser = parse(Auth.updateUserResponseSchema, await res.json())
    return { username: this.#currentUser.name }
  }

  async logIn(): Promise<UserInfo | null> {
    const hasExpired = await this.invalidateToken()
    if (hasExpired) {
      await this.popupLoginMode()
    }
    return this.me()
  }

  logOut(): Promise<void> {
    this.#currentUser = null
    clearAccessToken()
    return Promise.resolve()
  }

  async retrieveScoreboard({
    md5,
    playMode,
  }: RecordLevel): Promise<{ data: ScoreboardDataEntry[] }> {
    const res = await fetch(
      new URL(`/api/v1/scoreboard/${md5}/${playMode}`, this.baseUrl)
    )
    if (!res.ok) {
      throw new Error(await res.text())
    }

    const entries = parse(
      Scoreboard.getLeaderboardResponseSchema,
      await res.json()
    )
    return {
      data: entries.map(
        ({
          entry: {
            created_at,
            recorded_by,
            score: {
              score,
              combo,
              count: { meticulous, precise, good, offbeat, missed },
              total,
            },
          },
          rank,
        }) => ({
          rank,
          score,
          combo,
          count: [meticulous, precise, good, offbeat, missed],
          total,
          playerName: recorded_by.name,
          recordedAt: new Date(created_at),
        })
      ),
    }
  }

  async retrieveRecord(
    level: RecordLevel
  ): Promise<ScoreboardDataRecord | null> {
    if (!this.#currentUser) {
      return null
    }

    const accessToken = loadAccessToken()
    const res = await fetch(
      new URL(
        `/api/v1/scoreboard/${level.md5}/${level.playMode}/${encodeURIComponent(this.#currentUser.id)}`,
        this.baseUrl
      ),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    if (!res.ok) {
      throw new Error(await res.text())
    }

    const {
      entry: {
        score: {
          score,
          combo,
          total,
          count: { meticulous, precise, good, offbeat, missed },
        },
        recorded_by: { name },
        created_at,
      },
      play_count,
      play_nth,
      rank,
    } = parse(Scoreboard.getScoreResponseSchema, await res.json())
    return {
      ...level,
      rank,
      score,
      combo,
      count: [meticulous, precise, good, offbeat, missed],
      total,
      playerName: name,
      recordedAt: new Date(created_at),
      playNumber: play_nth,
      playCount: play_count,
    }
  }

  async submitScore(scoreInfo: ScoreInfo): Promise<ScoreboardDataRecord> {
    const accessToken = loadAccessToken()
    if (!accessToken) {
      throw new Error('not logged in')
    }

    const body: InferOutput<typeof Scoreboard.submitScoreRequestBodySchema> = {
      score: scoreInfo.score,
      combo: scoreInfo.combo,
      total: scoreInfo.total,
      count: {
        meticulous: scoreInfo.count[0],
        precise: scoreInfo.count[1],
        good: scoreInfo.count[2],
        offbeat: scoreInfo.count[3],
        missed: scoreInfo.count[4],
      },
    }
    const res = await fetch(
      new URL(
        `/api/v1/scoreboard/${scoreInfo.md5}/${scoreInfo.playMode}`,
        this.baseUrl
      ),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )
    if (!res.ok) {
      throw new Error(await res.text())
    }

    const { rank, entry, play_count, play_nth } = parse(
      Scoreboard.submitScoreResponseSchema,
      await res.json()
    )
    return {
      md5: entry.chart_md5,
      playMode: entry.play_mode,
      rank,
      score: entry.score.score,
      combo: entry.score.combo,
      count: [
        entry.score.count.meticulous,
        entry.score.count.precise,
        entry.score.count.good,
        entry.score.count.offbeat,
        entry.score.count.missed,
      ],
      total: entry.score.total,
      playerName: entry.recorded_by.name,
      recordedAt: new Date(entry.created_at),
      playCount: play_count,
      playNumber: play_nth,
    }
  }
}
