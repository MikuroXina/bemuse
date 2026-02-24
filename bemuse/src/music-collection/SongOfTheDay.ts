import type { Song } from '@bemuse/collection-model/types.js'
import _ from 'lodash'
import hash from 'object-hash'

export class SongOfTheDay {
  private ids: Set<string>
  constructor(songs: readonly Song[], { enabled = true } = {}) {
    if (!enabled) {
      this.ids = new Set()
      return
    }

    const sorted = _.sortBy(
      songs.filter((s) => !s.custom && !s.tutorial),
      (s) => hash(s.id)
    )
    this.ids = new Set(sorted.slice(0, 3).map((s) => s.id))
  }

  isSongOfTheDay(id: string) {
    return this.ids.has(id)
  }
}
