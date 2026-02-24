import type { Progress } from '@bemuse/progress/Progress.js'
import type { IResource, IResources } from '@bemuse/resources/types.js'
import type { ChartInfo } from '@mikuroxina/bemuse-types'

import type { GamePlayerOptionsInput } from '../game.js'

export type Assets = IResources & {
  progress?: {
    current?: Progress
    all?: Progress
  }
}

export type LoadSpec = {
  assets: Assets
  bms: IResource
  metadata: ChartInfo
  songId?: string
  displayMode?: 'touch3d' | 'normal'
  backImageUrl?: string
  eyecatchImageUrl?: string
  videoUrl?: string
  videoOffset?: number
  options: GamePlayerOptionsInput
}
