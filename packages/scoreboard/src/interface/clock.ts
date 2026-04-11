import { Temporal } from 'temporal-polyfill'

export interface Clock {
  now(): Temporal.Instant
}
