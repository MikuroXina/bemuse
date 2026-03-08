import { OFFICIAL_SERVER_URL, useCollection } from '@bemuse/query/collection.js'
import query from '@bemuse/utils/query.js'

import MusicTable from './MusicTable.js'

export const CollectionViewer = () => {
  const url = query.server || OFFICIAL_SERVER_URL
  const res = useCollection(url)

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
          data={res.data ?? null}
          url={url}
          initialSort={query.sort}
        />
      </div>
    </div>
  )
}

export default CollectionViewer
