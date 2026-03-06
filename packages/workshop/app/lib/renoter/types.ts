import * as v from 'valibot'
import type { BMSObject } from '@mikuroxina/bms'

export const timeKeySchema = v.custom<`${number}:${number}`>(
  (input) => typeof input === 'string' && /^\d+:\d+$/.test(input)
)
/** '<measure>:<offset>' where 1 quarter note = 240 */
export type TimeKey = `${number}:${number}`

export const channelSchema = v.union([
  v.literal('SC'),
  v.literal('K1'),
  v.literal('K2'),
  v.literal('K3'),
  v.literal('K4'),
  v.literal('K5'),
  v.literal('K6'),
  v.literal('K7'),
])
// the order of channels are used to calculate positions of notes, so we should not reorder this
export const channels = [
  'SC',
  'K1',
  'K2',
  'K3',
  'K4',
  'K5',
  'K6',
  'K7',
] as const
export type Channel = v.InferOutput<typeof channelSchema>

export interface ObjectRow {
  y: number
  objects: BMSObject[]
  timeKey: TimeKey
}

export const notesMapSchema = v.record(
  timeKeySchema,
  v.record(
    channelSchema,
    v.object({
      /** Keysound ID to use */
      value: v.string(),
      /** Length of the note, where 1 quarter note = 240 */
      length: v.optional(v.number()),
    })
  )
)
export type NotesMap = v.InferOutput<typeof notesMapSchema>

export const renoteDataSchema = v.object({
  source: v.string(),
  suffix: v.optional(v.string()),
  replace: v.optional(v.record(v.string(), v.string())),
  add: v.optional(v.array(v.string())),
  newNotes: v.optional(notesMapSchema),
  groups: v.optional(
    v.array(
      v.object({
        patterns: v.array(v.string()),
      })
    )
  ),
})
export type RenoteData = v.InferOutput<typeof renoteDataSchema>
