import { assert, describe, expect, it } from 'vitest'

import createKeysoundCache from './create-keysound-cache'

describe('A keysound cache', function () {
  it('starts empty', () => {
    const cache = createKeysoundCache()
    assert(cache.isEmpty())
  })

  it('is unusable until song is selected', () => {
    const cache = createKeysoundCache()
    expect(() => {
      cache.cache('sound1', new AudioBuffer({ length: 2, sampleRate: 3000 }))
    }).toThrow()
  })

  it('can add keysound to the cache', () => {
    const cache = createKeysoundCache()

    const buf = new AudioBuffer({ length: 2, sampleRate: 3000 })
    cache.receiveSongId('songId1')
    cache.cache('sound1', buf)

    assert(!cache.isEmpty())
    assert(cache.isCached('sound1') === true)
    assert(cache.get('sound1') === buf)
  })

  it('keeps keysounds in the cache if song did not change', () => {
    const cache = createKeysoundCache()

    const buf = new AudioBuffer({ length: 2, sampleRate: 3000 })
    cache.receiveSongId('songId1')
    cache.cache('sound1', buf)
    cache.receiveSongId('songId1')

    assert(!cache.isEmpty())
  })

  it('clears when song change', () => {
    const cache = createKeysoundCache()

    const buf = new AudioBuffer({ length: 2, sampleRate: 3000 })
    cache.receiveSongId('songId1')
    cache.cache('sound1', buf)
    cache.receiveSongId('songId2')

    assert(cache.isEmpty())
  })
})
