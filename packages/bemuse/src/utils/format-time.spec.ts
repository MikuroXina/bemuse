import { describe, expect, it } from 'vitest'

import formatTime from './format-time'

describe('formatTime', () => {
  it('should format the time using minutes:seconds format', () => {
    expect(formatTime(0)).toStrictEqual('0:00')
    expect(formatTime(1)).toStrictEqual('0:01')
    expect(formatTime(11)).toStrictEqual('0:11')
    expect(formatTime(111)).toStrictEqual('1:51')
    expect(formatTime(1111)).toStrictEqual('18:31')
  })
})
