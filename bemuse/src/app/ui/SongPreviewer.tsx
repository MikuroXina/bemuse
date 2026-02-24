import type { Song } from '@bemuse/collection-model/types.js'
import getPreviewResourceUrl from '@bemuse/music-collection/getPreviewResourceUrl.js'
import MusicSelectPreviewer from '@bemuse/music-previewer/MusicSelectPreviewer.js'
import { useEffect, useState } from 'react'

export default function SongPreviewer(props: {
  song: Song
  serverUrl: string
}) {
  const { song, serverUrl } = props
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    getPreviewResourceUrl(song, serverUrl)
      .then((url) => setUrl(url))
      .catch(() => {
        setUrl(null)
      })
  }, [song, serverUrl])
  return <MusicSelectPreviewer url={url} />
}
