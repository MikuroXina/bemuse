import { buildName, version } from '@bemuse/utils/build-define.js'

import styles from './Boot.module.scss'

export interface BootProps {
  hidden?: boolean
  status?: string
}

export default function Boot({ hidden, status = 'Loading page' }: BootProps) {
  return (
    <div id='boot' className={styles.boot} data-hidden={hidden}>
      <div className={styles.content}>
        <div className={styles.dj} />
        <div className={styles.text}>
          <div>
            <strong>
              {buildName()} <span>{version()}</span>
            </strong>
          </div>
          <div>{status}</div>
        </div>
      </div>
    </div>
  )
}
