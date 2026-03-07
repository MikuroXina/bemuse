import type { MusicServerIndex } from '@mikuroxina/bemuse-types'
import { useQuery, type UseQueryResult } from 'react-query'

export const OFFICIAL_SERVER_URL = 'https://music4.bemuse.ninja/server'

export function getServerIndexFileUrl(serverUrl: string) {
  if (serverUrl.endsWith('/bemuse-song.json')) {
    return serverUrl
  }
  return serverUrl.replace(/\/(?:index\.json)?$/, '') + '/index.json'
}

async function load(serverUrl: string): Promise<MusicServerIndex> {
  const indexUrl = getServerIndexFileUrl(serverUrl)
  const response = await fetch(indexUrl)
  const data = await response.json()

  if (Array.isArray(data.songs)) {
    return data
  }
  if (Array.isArray(data.charts)) {
    // Single-song server
    const lastSlash = indexUrl.lastIndexOf('/')
    const dir =
      lastSlash === -1 ? indexUrl : indexUrl.substring(0, lastSlash + 1)
    return { songs: [{ ...data, id: 'song', path: dir }] }
  }
  throw new Error(
    `Invalid server file at ${indexUrl}: Does not contain "songs" array.`
  )
}

export function useCollection(
  serverUrl: string
): UseQueryResult<MusicServerIndex, Error> {
  return useQuery({
    queryKey: ['collection', serverUrl],
    queryFn: ({ queryKey: [, url] }) => load(url),
  })
}
