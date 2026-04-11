import type { Auth } from '@mikuroxina/scoreboard-types'
import type { Temporal } from 'temporal-polyfill'
import type { Brand } from 'valibot'

import type { Clock } from '../interface/clock'
import type { IDGenerator } from '../interface/id-gen'
import type { IDProvider } from '../interface/idp'

export const idProvider = (): IDProvider => ({
  userId: async (accessToken) =>
    accessToken.startsWith('FAKE!')
      ? (accessToken.slice('FAKE!'.length) as Auth.UserId)
      : null,
})

export const constantClock = (timestamp: Temporal.Instant): Clock => ({
  now: () => timestamp,
})

export const constantIdGen = (id: string): IDGenerator => ({
  nextId: <K extends string>() => id as string & Brand<K>,
})
