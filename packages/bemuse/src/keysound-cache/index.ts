import createKeysoundCache from './createKeysoundCache'

export interface KeysoundCache {
  receiveSongId(nextSongId: string): void
  isEmpty(): boolean
  isCached(soundName: string): boolean
  cache(soundName: string, audioBuffer: AudioBuffer): void
  get(soundName: string): AudioBuffer | undefined
}

export default createKeysoundCache()
