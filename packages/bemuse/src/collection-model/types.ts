/* eslint camelcase: off */
/* REASON: These snake case names are used in our JSON files. */

import type { IResources } from '@bemuse/resources/types.js'
import type { Chart, SongMetadataInCollection } from '@mikuroxina/bemuse-types'

export interface Song extends SongMetadataInCollection {
  /** Resources that loaded the song file. Added by Bemuse at runtime. */
  resources?: IResources

  /** `true` if this is loaded from a custom song. */
  custom?: boolean

  /** `true` if this is an unreleased song. */
  unreleased?: boolean

  /** `true` if this is a special song specified by the song server. */
  songOfTheDay?: boolean
}

export type { Chart }
