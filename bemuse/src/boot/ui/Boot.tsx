import './Boot.scss'

import version from '@bemuse/utils/version.js'
import React from 'react'

export interface BootProps {
  hidden?: boolean
  status?: string
}

export default function Boot({ hidden, status = 'Loading page' }: BootProps) {
  return (
    <div id='boot' className='Boot' data-hidden={hidden}>
      <div className='Bootのcontent'>
        <div className='Bootのdj' />
        <div className='Bootのtext'>
          <div>
            <strong>
              Bemuse <span>{`v${version}`}</span>
            </strong>
          </div>
          <div>${status}</div>
        </div>
      </div>
    </div>
  )
}
