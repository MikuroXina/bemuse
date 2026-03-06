import * as v from 'valibot'
import { songMetadataSchema } from '@mikuroxina/bemuse-types'

export const urlEntrySchema = v.object({
  url: v.string(),
  added: v.optional(v.string()),
  title: v.optional(v.string()),
})
export type UrlEntry = v.InferOutput<typeof urlEntrySchema>

export const songEntrySchema = v.object({
  ...songMetadataSchema.entries,
  id: v.string(),
  path: v.string(),
})
export type SongEntry = v.InferOutput<typeof songEntrySchema>

export const serverFileSchema = v.object({
  urls: v.array(urlEntrySchema),
  songs: v.array(songEntrySchema),
})
export type ServerFile = v.InferOutput<typeof serverFileSchema>
