import { env } from 'cloudflare:workers'
import { Temporal } from 'temporal-polyfill'
import { expect, test, vi } from 'vitest'

import {
  constantClock,
  constantIdGen,
  idProvider,
} from '../src/adaptor/mock.js'
import type { UserRepository } from '../src/interface/user.js'
import { submitScore } from '../src/service/scoreboard.js'

test('Submit a new record', async () => {
  const clock = constantClock(new Temporal.Instant(0n))
  const idGen = constantIdGen('qux')
  const userRepo: UserRepository = {
    userInfo: async (id) => ({
      id,
      name: 'Foo',
      created_at: new Date(2020, 0, 1).toISOString(),
      is_frozen: false,
    }),
    userInfoBatch: async () => ({}),
  }
  const userInfoMock = vi.spyOn(userRepo, 'userInfo')

  const res = await submitScore({
    db: env.score,
    accessToken: 'FAKE!test1',
    clock,
    idGen,
    idp: idProvider(),
    userRepo,
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
        id: 'test1',
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
  expect(userInfoMock).toHaveBeenCalledWith('test1')
})
