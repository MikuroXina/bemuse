import type { PlayerOptionsPlacement } from '@bemuse/game/player.js'

export type StoredOptions = {
  'system.offset.audio-input': string
  'player.P1.speed': string
  'player.P1.panel': PlayerOptionsPlacement
}

export interface Result {
  1: number
  2: number
  3: number
  4: number
  missed: number
  totalCombo: number
  maxCombo: number
  accuracy: number
  grade: string
  score: number
  deltas: readonly number[]
  totalNotes: number
  tainted: boolean
  log: string
}
