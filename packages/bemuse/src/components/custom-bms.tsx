import type { Song } from '@bemuse/collection-model/types.js'
import Panel from '@bemuse/components/common/panel.js'
import { loadSongFromResources } from '@bemuse/custom-song-loader/index.js'
import type { ICustomSongResources } from '@bemuse/resources/types.js'
import { type DragEventHandler, type JSX, useEffect, useState } from 'react'

import {
  handleClipboardPaste,
  handleCustomSongFileSelect,
  handleCustomSongFolderDrop,
  handleCustomSongURLLoad,
} from '../app/io/custom-songs-io.js'
import {
  consumePendingArchiveURL,
  hasPendingArchiveToLoad,
} from '../app/preloaded-custom-bms.js'
import styles from './custom-bms.module.scss'

export interface CustomBMSProps {
  onSongLoaded?: (song: Song) => void
}

const CustomBMS = ({ onSongLoaded }: CustomBMSProps) => {
  const [log, setLog] = useState<readonly string[]>([])
  const [hover, setHover] = useState(false)

  async function onLoadResources(resources: ICustomSongResources) {
    if (!onSongLoaded) {
      return
    }
    try {
      const song = await loadSongFromResources(resources, {
        onMessage: (message) => setLog((log) => [...log, message]),
      })
      song.id = '__custom_' + Date.now()
      song.custom = true
      if (song && song.charts && song.charts.length) {
        onSongLoaded(song)
        return
      }
      throw new Error('there are no charts in song')
    } catch (e) {
      console.error(e)
    } finally {
      setLog([])
    }
  }

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const resources = handleClipboardPaste(e)
      if (resources) {
        onLoadResources(resources)
      }
    }
    window.addEventListener('paste', handlePaste)
    if (hasPendingArchiveToLoad()) {
      onLoadResources(handleCustomSongURLLoad(consumePendingArchiveURL()!))
    }
    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [])

  const handleDragEnter: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
  }
  const handleDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    setHover(true)
    e.preventDefault()
  }
  const handleDragLeave: DragEventHandler<HTMLDivElement> = (e) => {
    setHover(false)
    e.preventDefault()
  }
  const handleDrop: DragEventHandler<HTMLDivElement> = (e) => {
    setHover(false)
    e.preventDefault()
    onLoadResources(handleCustomSongFolderDrop(e.nativeEvent))
  }
  const handleFileSelect = (file: File) => {
    onLoadResources(handleCustomSongFileSelect(file))
  }

  return (
    <Panel title='Load Custom BMS'>
      <div className={styles.wrapper}>
        <div className={styles.instruction}>
          Please drag and drop a BMS folder into the drop zone below.
        </div>
        <div className={styles.remark}>
          This feature is only supported in Google Chrome and Firefox.
        </div>
        <div className={styles.remark}>
          Please don’t play unauthorized / illegally obtained BMS files.
        </div>
        <div
          className={styles.dropzone}
          data-hover={hover}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {log.length === 0 ? (
            <div className={styles.dropzoneHint}>
              Drop BMS folder here.
              <label className={styles.dropzoneInputLabel}>
                <input
                  type='file'
                  className={styles.dropzoneInput}
                  accept='.zip,.7z,.rar,.bms,.bml,.bme,.bmson'
                  onChange={(e) => {
                    handleFileSelect(e.target.files![0])
                  }}
                />
                Select File on Device.
              </label>
            </div>
          ) : (
            <LogTextarea log={log} />
          )}
        </div>
      </div>
    </Panel>
  )
}

const LogTextarea = ({ log }: { log: readonly string[] }): JSX.Element => (
  <div className={styles.log}>
    {log.map((text, i) => (
      <p key={i}>{text}</p>
    ))}
  </div>
)

export default CustomBMS
