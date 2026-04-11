import type { Auth } from '@mikuroxina/scoreboard-types'
import { env } from 'cloudflare:workers'
import { Temporal } from 'temporal-polyfill'
import { beforeAll, describe, expect, test } from 'vitest'

import { builtInIdGen } from '../src/adaptor/built-in'
import { constantClock, idProvider } from '../src/adaptor/mock'
import type { UserQuery, UserRepository } from '../src/interface/user'
import { freezeUser, unfreezeUser } from '../src/service/moderation'
import { getLeaderboard, submitScore } from '../src/service/scoreboard'

const frozen: Set<Auth.UserId> = new Set()

const userRepo: UserRepository = {
  freeze: async (userId) => {
    frozen.add(userId)
  },
  unfreeze: async (userId) => {
    frozen.delete(userId)
  },
}

const userQuery: UserQuery = {
  userInfo: async (id) => ({
    id,
    name: 'Foo',
    created_at: new Date(2020, 0, 1).toISOString(),
    is_frozen: frozen.has(id),
  }),
  userInfoBatch: async (ids) =>
    Object.fromEntries(
      await Promise.all(
        ids.map(
          async (id): Promise<[Auth.UserId, Auth.UserInfo]> => [
            id,
            await userQuery.userInfo(id),
          ]
        )
      )
    ),
}

const addScore =
  (db: D1Database, chartMd5: string) =>
  async (name: string, score: number): Promise<void> => {
    const clock = constantClock(new Temporal.Instant(0n))
    await submitScore({
      db,
      accessToken: `FAKE!${name}`,
      clock,
      idGen: builtInIdGen(),
      idp: idProvider(),
      userRepo: userQuery,
      param: {
        chart_md5: chartMd5,
        play_mode: 'TS',
      },
      toSubmit: {
        score,
        combo: 0,
        total: 0,
        count: {
          meticulous: 0,
          precise: 0,
          good: 0,
          offbeat: 0,
          missed: 0,
        },
      },
    })
  }

describe.sequential('moderation', () => {
  beforeAll(async () => {
    const addEntry = addScore(env.score, 'deadbeef')
    await addEntry('tester1', 111111)
    await addEntry('rival', 222222)
    await addEntry('unbeatable', 555554)
  })

  test('freeze and hide', async () => {
    expect(
      await getLeaderboard({
        param: {
          chart_md5: 'deadbeef',
          play_mode: 'TS',
        },
        score: env.score,
        userRepo: userQuery,
      })
    ).toMatchObject([
      {
        entry: {
          chart_md5: 'deadbeef',
          created_at: '1970-01-01T00:00:00.000Z',
          play_mode: 'TS',
          recorded_by: {
            id: 'unbeatable',
            name: 'Foo',
          },
          score: {
            combo: 0,
            count: {
              good: 0,
              meticulous: 0,
              missed: 0,
              offbeat: 0,
              precise: 0,
            },
            score: 555554,
            total: 0,
          },
        },
        rank: 1,
      },
      {
        entry: {
          chart_md5: 'deadbeef',
          created_at: '1970-01-01T00:00:00.000Z',
          play_mode: 'TS',
          recorded_by: {
            id: 'rival',
            name: 'Foo',
          },
          score: {
            combo: 0,
            count: {
              good: 0,
              meticulous: 0,
              missed: 0,
              offbeat: 0,
              precise: 0,
            },
            score: 222222,
            total: 0,
          },
        },
        rank: 2,
      },
      {
        entry: {
          chart_md5: 'deadbeef',
          created_at: '1970-01-01T00:00:00.000Z',
          play_mode: 'TS',
          recorded_by: {
            id: 'tester1',
            name: 'Foo',
          },
          score: {
            combo: 0,
            count: {
              good: 0,
              meticulous: 0,
              missed: 0,
              offbeat: 0,
              precise: 0,
            },
            score: 111111,
            total: 0,
          },
        },
        rank: 3,
      },
    ])

    await freezeUser({
      param: { user_id: 'unbeatable' as Auth.UserId },
      score: env.score,
      userRepo,
    })

    expect(
      await getLeaderboard({
        param: {
          chart_md5: 'deadbeef',
          play_mode: 'TS',
        },
        score: env.score,
        userRepo: userQuery,
      })
    ).toMatchObject([
      {
        entry: {
          chart_md5: 'deadbeef',
          created_at: '1970-01-01T00:00:00.000Z',
          play_mode: 'TS',
          recorded_by: {
            id: 'rival',
            name: 'Foo',
          },
          score: {
            combo: 0,
            count: {
              good: 0,
              meticulous: 0,
              missed: 0,
              offbeat: 0,
              precise: 0,
            },
            score: 222222,
            total: 0,
          },
        },
        rank: 1,
      },
      {
        entry: {
          chart_md5: 'deadbeef',
          created_at: '1970-01-01T00:00:00.000Z',
          play_mode: 'TS',
          recorded_by: {
            id: 'tester1',
            name: 'Foo',
          },
          score: {
            combo: 0,
            count: {
              good: 0,
              meticulous: 0,
              missed: 0,
              offbeat: 0,
              precise: 0,
            },
            score: 111111,
            total: 0,
          },
        },
        rank: 2,
      },
    ])
  })

  test('unfreeze and show', async () => {
    await unfreezeUser({
      param: { user_id: 'unbeatable' as Auth.UserId },
      score: env.score,
      userRepo,
    })

    expect(
      await getLeaderboard({
        param: {
          chart_md5: 'deadbeef',
          play_mode: 'TS',
        },
        score: env.score,
        userRepo: userQuery,
      })
    ).toMatchObject([
      {
        entry: {
          chart_md5: 'deadbeef',
          created_at: '1970-01-01T00:00:00.000Z',
          play_mode: 'TS',
          recorded_by: {
            id: 'unbeatable',
            name: 'Foo',
          },
          score: {
            combo: 0,
            count: {
              good: 0,
              meticulous: 0,
              missed: 0,
              offbeat: 0,
              precise: 0,
            },
            score: 555554,
            total: 0,
          },
        },
        rank: 1,
      },
      {
        entry: {
          chart_md5: 'deadbeef',
          created_at: '1970-01-01T00:00:00.000Z',
          play_mode: 'TS',
          recorded_by: {
            id: 'rival',
            name: 'Foo',
          },
          score: {
            combo: 0,
            count: {
              good: 0,
              meticulous: 0,
              missed: 0,
              offbeat: 0,
              precise: 0,
            },
            score: 222222,
            total: 0,
          },
        },
        rank: 2,
      },
      {
        entry: {
          chart_md5: 'deadbeef',
          created_at: '1970-01-01T00:00:00.000Z',
          play_mode: 'TS',
          recorded_by: {
            id: 'tester1',
            name: 'Foo',
          },
          score: {
            combo: 0,
            count: {
              good: 0,
              meticulous: 0,
              missed: 0,
              offbeat: 0,
              precise: 0,
            },
            score: 111111,
            total: 0,
          },
        },
        rank: 3,
      },
    ])
  })
})
