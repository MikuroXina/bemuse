import type { Song } from '@bemuse/collection-model/types.js'
import hash from 'object-hash'

export class SongOfTheDay {
  private ids: Set<string>
  constructor(songs: readonly Song[], { enabled = true } = {}) {
    if (!enabled) {
      this.ids = new Set()
      return
    }

    const sorted = songs
      .filter((s) => !s.custom && !s.tutorial)
      .sort((a, b) => {
        const aHash = hash(a.id)
        const bHash = hash(b.id)
        if (aHash < bHash) {
          return -1
        }
        if (aHash > bHash) {
          return 1
        }
        return 0
      })
    this.ids = new Set(sorted.slice(0, 3).map((s) => s.id))
  }

  isSongOfTheDay(id: string) {
    return this.ids.has(id)
  }
}
