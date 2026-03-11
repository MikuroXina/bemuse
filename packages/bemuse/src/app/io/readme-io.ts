import type { Song } from '@bemuse/collection-model/types.js'
import { getSongResources } from '@bemuse/music-collection/get-song-resources.js'
import { useEffect, useState } from 'react'

export function useReadme(serverUrl: string, song: Song): string | null {
  const [readme, setReadme] = useState<string | null>(null)

  useEffect(() => {
    requestReadmeForUrl(serverUrl, song).then(setReadme).catch(console.error)
  }, [serverUrl, song])

  return readme
}

async function requestReadmeForUrl(
  serverUrl: string,
  song: Song
): Promise<string> {
  if (!song.readme) {
    return ''
  }
  const resources = getSongResources(song, serverUrl)
  const file = await resources.baseResources.file(song.readme)
  const buffer = await file.read()
  const readme = await new Blob([buffer], { type: 'text/plain' }).text()
  const text = stripFrontMatter(readme)
  return text
}

function stripFrontMatter(text: string) {
  return text.replace(/\r\n|\r|\n/g, '\n').replace(/^---\n[\s\S]*?\n---/, '')
}
