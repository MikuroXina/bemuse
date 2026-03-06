import type { SongMetadata } from '@mikuroxina/bemuse-types'

export interface ServerFile {
  urls: UrlEntry[]
  songs: SongEntry[]
}

export interface UrlEntry {
  url: string
  added?: string
  title?: string
}

export interface SongEntry extends SongMetadata {
  id: string
  path: string
}
