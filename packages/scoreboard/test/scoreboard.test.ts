import type { Auth } from '@mikuroxina/scoreboard-types'
import { env } from 'cloudflare:workers'
import { Temporal } from 'temporal-polyfill'
import { beforeEach, expect, test, vi } from 'vitest'

import { builtInIdGen } from '../src/adaptor/built-in.js'
import {
  constantClock,
  constantIdGen,
  idProvider,
} from '../src/adaptor/mock.js'
import type { UserQuery } from '../src/interface/user.js'
import { getLeaderboard, submitScore } from '../src/service/scoreboard.js'

beforeEach(async () => {
  await env.score.exec('DELETE FROM score_record;')
})

const userQuery: UserQuery = {
  userInfo: async (id) => ({
    id,
    name: 'Foo',
    created_at: new Date(2020, 0, 1).toISOString(),
    is_frozen: false,
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

test('Submit a new record', async () => {
  const clock = constantClock(new Temporal.Instant(0n))
  const idGen = constantIdGen('qux')
  const userInfoMock = vi.spyOn(userQuery, 'userInfo')

  const res = await submitScore({
    db: env.score,
    accessToken: 'FAKE!tester1',
    clock,
    idGen,
    idp: idProvider(),
    userRepo: userQuery,
    param: {
      chart_md5: 'deadbeef',
      play_mode: 'TS',
    },
    toSubmit: {
      score: 111111,
      combo: 1,
      total: 1,
      count: {
        meticulous: 0,
        precise: 0,
        good: 1,
        offbeat: 0,
        missed: 0,
      },
    },
  })

  expect(res).toStrictEqual({
    entry: {
      chart_md5: 'deadbeef',
      created_at: '1970-01-01T00:00:00.000Z',
      id: 'qux',
      play_mode: 'TS',
      recorded_by: {
        id: 'tester1',
        name: 'Foo',
      },
      score: {
        combo: 1,
        count: {
          good: 1,
          meticulous: 0,
          missed: 0,
          offbeat: 0,
          precise: 0,
        },
        log: undefined,
        score: 111111,
        total: 1,
      },
    },
    play_count: 1,
    play_nth: 1,
    rank: 1,
  })
  expect(userInfoMock).toHaveBeenCalledWith('tester1')
})

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

test('Retrieve leaderboard', async () => {
  const addEntry = addScore(env.score, 'deadbeef')
  await addEntry('tester1', 111111)
  await addEntry('rival', 222222)
  await addEntry('unbeatable', 555554)

  const res = await getLeaderboard({
    param: {
      chart_md5: 'deadbeef',
      play_mode: 'TS',
    },
    score: env.score,
    userRepo: userQuery,
  })

  expect(res).toMatchObject([
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
