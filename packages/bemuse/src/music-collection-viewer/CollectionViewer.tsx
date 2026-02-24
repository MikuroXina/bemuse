import { load, OFFICIAL_SERVER_URL } from '@bemuse/music-collection/index.js'
import preprocessCollection from '@bemuse/music-collection/preprocessCollection.js'
import query from '@bemuse/utils/query.js'
import type { MusicServerIndex } from 'bemuse-types'
import { useEffect, useState } from 'react'

import MusicTable from './MusicTable.js'

export const CollectionViewer = () => {
  const [status, setStatus] = useState('Loading')
  const [data, setData] = useState<MusicServerIndex | null>(null)

  const url = query.server || OFFICIAL_SERVER_URL

  useEffect(() => {
    load(url).then(
      (result) => {
        setStatus('Load completed')
        setData(result)
      },
      (e: Error) => {
        setStatus('Load error: ' + e)
      }
    )
  }, [])

  return (
    <div>
      <header style={{ textAlign: 'center' }}>
        <h1>Bemuse collection viewer</h1>
        <div>
          {url}
          <br />
          {status}
        </div>
      </header>
      <div style={{ padding: 20 }}>
        <MusicTable
          data={data && preprocessCollection(data)}
          url={url}
          initialSort={query.sort}
        />
      </div>
    </div>
  )
}

export default CollectionViewer
