import type { BMSObject } from '@mikuroxina/bms'

export interface ObjectRow {
  y: number
  objects: BMSObject[]
  timeKey: string
}

export type NoteKey = 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6' | 'K7' | 'SC'

export interface NotesMap {
  /** timeKey — '<measure>:<offset>' where 1 quarter note = 240 */
  [timeKey: `${number}:${number}`]: {
    [K in NoteKey]: {
      /** Keysound ID to use */
      value: string
      /** Length of the note, where 1 quarter note = 240 */
      length?: number
    }
  }
}

export interface RenoteData {
  source: string
  suffix?: string
  replace?: Record<string, string>
  add?: string[]
  newNotes?: NotesMap
  groups?: {
    patterns: string[]
  }[]
}
