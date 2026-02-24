import type { Song } from '@bemuse/collection-model/types.js'

import { getSongResources } from './getSongResources.js'

export default async function getPreviewResourceUrl(
  song: Song,
  serverUrl: string
): Promise<string | null> {
  if (!song) return null
  if (song.tutorial) return null
  const { baseResources } = getSongResources(song, serverUrl)
  const file = await baseResources.file(
    song.preview_url || '_bemuse_preview.mp3'
  )
  return file.resolveUrl()
}
