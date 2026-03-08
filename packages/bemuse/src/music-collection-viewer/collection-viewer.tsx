import { OFFICIAL_SERVER_URL, useCollection } from '@bemuse/query/collection.js'
import query from '@bemuse/utils/query.js'

import styles from './collection-viewer.module.css'
import MusicTable from './music-table.js'

export const CollectionViewer = () => {
  const url = query.server || OFFICIAL_SERVER_URL
  const res = useCollection(url)

  return (
    <div>
      <header className={styles.header}>
        <h1>Bemuse collection viewer</h1>
        <div>
          {url}
          <br />
          {res.status}
        </div>
      </header>
      <div className={styles.table}>
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
