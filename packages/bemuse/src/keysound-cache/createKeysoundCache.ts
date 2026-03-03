import invariant from 'invariant'

import type { KeysoundCache } from './index.js'

export function createKeysoundCache(): KeysoundCache {
  const map = new Map<string, AudioBuffer>()
  let _lastSongId: string | undefined
  return {
    receiveSongId(nextSongId: string): void {
      if (_lastSongId !== nextSongId) {
        _lastSongId = nextSongId
        map.clear()
      }
    },
    isEmpty(): boolean {
      return map.size === 0
    },
    isCached(soundName: string): boolean {
      return map.has(soundName)
    },
    cache(soundName: string, audioBuffer: AudioBuffer): void {
      invariant(_lastSongId, 'Expected current song to be set.')
      map.set(soundName, audioBuffer)
    },
    get(soundName: string): AudioBuffer | undefined {
      return map.get(soundName)
    },
  }
}

export default createKeysoundCache
