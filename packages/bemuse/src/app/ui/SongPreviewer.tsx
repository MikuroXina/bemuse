import type { Song } from '@bemuse/collection-model/types.js'
import getPreviewResourceUrl from '@bemuse/music-collection/getPreviewResourceUrl.js'
import MusicSelectPreviewer from '@bemuse/music-previewer/MusicSelectPreviewer.js'
import { useQuery } from 'react-query'

export default function SongPreviewer({
  song,
  serverUrl,
}: {
  song: Song
  serverUrl: string
}) {
  const res = useQuery({
    queryKey: ['song-preview', song, serverUrl] as const,
    queryFn: () => getPreviewResourceUrl(song, serverUrl),
  })
  return <MusicSelectPreviewer url={res.data ?? null} />
}
