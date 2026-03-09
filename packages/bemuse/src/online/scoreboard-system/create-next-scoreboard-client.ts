import invariant from 'invariant'

import type { ScoreboardClient, ScoreboardRow } from './scoreboard-client.js'

export interface CreateScoreboardClientOptions {
  /**
   * The URL of the scoreboard server.
   */
  server: string

  log: unknown
}

export function createNextScoreboardClient({
  server: base,
}: CreateScoreboardClientOptions): ScoreboardClient {
  async function getMyRecord(
    playerToken: string,
    md5: string,
    playMode: string
  ) {
    try {
      const response = await fetch(
        new URL(`/api/scoreboard/${md5}/${playMode}/mine`, base),
        {
          headers: { Authorization: `Bearer ${playerToken}` },
        }
      )
      return (await response.json()).data as ScoreboardRow
    } catch (err) {
      throw new Error('Unable to retrieve personal records', { cause: err })
    }
  }

  const scoreboardClient: ScoreboardClient = {
    async signUp({ username, password, email }) {
      invariant(typeof username === 'string', 'username must be a string')
      invariant(typeof password === 'string', 'password must be a string')
      invariant(typeof email === 'string', 'email must be a string')
      try {
        const response = await fetch(new URL('/api/auth/signup', base), {
          method: 'POST',
          body: JSON.stringify({
            username,
            password,
            email,
          }),
        })
        return { playerToken: (await response.json()).playerToken }
      } catch (err) {
        throw new Error('Unable to sign up', { cause: err })
      }
    },
    async loginByUsernamePassword({ username, password }) {
      invariant(typeof username === 'string', 'username must be a string')
      invariant(typeof password === 'string', 'password must be a string')
      try {
        const response = await fetch(new URL('/api/auth/login', base), {
          method: 'POST',
          body: JSON.stringify({
            username,
            password,
          }),
        })
        return { playerToken: (await response.json()).playerToken }
      } catch (err) {
        throw new Error('Unable to log in', { cause: err })
      }
    },
    async changePassword({ email }) {
      try {
        await fetch('/api/auth/reset', {
          method: 'POST',
          body: JSON.stringify({ email }),
        })
        return {}
      } catch (err) {
        throw new Error('Unable to request password reset', { cause: err })
      }
    },
    async submitScore({ playerToken, md5, playMode, input }) {
      try {
        await fetch(
          new URL(`/api/scoreboard/${md5}/${playMode}/submit`, base),
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${playerToken}` },
            body: JSON.stringify({ scoreData: input }),
          }
        )
        return {
          data: {
            registerScore: {
              resultingRow: await getMyRecord(playerToken, md5, playMode),
            },
          },
        }
      } catch (err) {
        throw new Error('Unable to submit score', { cause: err })
      }
    },
    async retrieveScoreboard({ md5, playMode }) {
      try {
        const response = await fetch(
          new URL(`/api/scoreboard/${md5}/${playMode}/leaderboard`, base)
        )
        return {
          data: {
            chart: {
              level: {
                leaderboard: (await response.json()).data,
              },
            },
          },
        }
      } catch (err) {
        throw new Error('Unable to retrieve leaderboard', { cause: err })
      }
    },
    async retrieveRecord({ playerToken, md5, playMode }) {
      return {
        data: {
          chart: {
            level: {
              myRecord: await getMyRecord(playerToken, md5, playMode),
            },
          },
        },
      }
    },
    async retrieveRankingEntries({ playerToken, md5s }) {
      try {
        const response = await fetch(new URL('/api/scoreboard/records', base), {
          method: 'POST',
          headers: { Authorization: `Bearer ${playerToken}` },
          body: JSON.stringify({ md5s }),
        })
        return {
          data: {
            me: {
              records: (await response.json()).data,
            },
          },
        }
      } catch (err) {
        throw new Error('Unable to retrieve ranking entries', { cause: err })
      }
    },
    async renewPlayerToken({ playerToken }) {
      try {
        const response = await fetch('/api/auth/renew', {
          method: 'POST',
          headers: { Authorization: `Bearer ${playerToken}` },
        })
        return (await response.json()).playerToken
      } catch (err) {
        throw new Error('Unable to renew token', { cause: err })
      }
    },
  }

  return scoreboardClient
}
