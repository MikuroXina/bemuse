import { Temporal } from 'temporal-polyfill'
import type { Brand } from 'valibot'

import type { Clock } from '../interface/clock'
import type { IDGenerator } from '../interface/id-gen'

export const builtInClock = (): Clock => ({
  now: Temporal.Now.instant,
})

export const builtInIdGen = (): IDGenerator => ({
  nextId: <K extends string>() => crypto.randomUUID() as string & Brand<K>,
})
