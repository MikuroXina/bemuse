import bytes from 'bytes'

import type { Progress } from './progress'

const wrap = (f: (progress: Progress) => string) => (progress: Progress) =>
  progress.progress !== null ? f(progress) : ''

// Formats the `Progress` as bytes (e.g. 1.23mb of 1.31mb).
export const BYTES_FORMATTER = wrap(
  (progress) =>
    bytes(progress.current ?? 0) + ' / ' + bytes(progress.total ?? 0)
)

// Formats the `Progress` as percentage.
export const PERCENTAGE_FORMATTER = wrap(
  (progress) =>
    (((progress.current ?? 0) / (progress.total ?? 1)) * 100).toFixed(1) + '%'
)

// Formats the `Progress` simply by using the value of `Progress#extra`.
export const EXTRA_FORMATTER = wrap((progress) => progress.extra + '')
