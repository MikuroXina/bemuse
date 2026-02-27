import type { Song } from '@bemuse/collection-model/types.js'
import Panel from '@bemuse/ui/Panel.js'
import { type DragEventHandler, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useCustomSongLoaderLog } from '../app/CustomSongs.js'
import * as CustomSongsIO from '../app/io/CustomSongsIO.js'
import {
  consumePendingArchiveURL,
  hasPendingArchiveToLoad,
} from '../app/PreloadedCustomBMS.js'
import styles from './CustomBMS.module.scss'

export interface CustomBMSProps {
  onSongLoaded?: (song: Song) => void
}

const CustomBMS = ({ onSongLoaded }: CustomBMSProps) => {
  const log = useCustomSongLoaderLog()
  const [hover, setHover] = useState(false)
  const dropzoneInput = useRef<HTMLInputElement>(null)

  const dispatch = useDispatch()

  const onFileDrop = CustomSongsIO.handleCustomSongFolderDrop(dispatch)
  const loadFromURL = CustomSongsIO.handleCustomSongURLLoad(dispatch)
  const onFileSelect = CustomSongsIO.handleCustomSongFileSelect(dispatch)

  useEffect(() => {
    const onPaste = CustomSongsIO.handleClipboardPaste(dispatch)
    const handlePaste = async (e: Event) => {
      const song = await onPaste(e as ClipboardEvent)
      if (song) {
        if (onSongLoaded) onSongLoaded(song)
      }
    }
    window.addEventListener('paste', handlePaste)
    if (hasPendingArchiveToLoad()) {
      loadFromURL(consumePendingArchiveURL()!).then((song) => {
        if (song && onSongLoaded) onSongLoaded(song)
      })
    }
    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [dispatch])

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
    onFileDrop(e.nativeEvent).then((song) => {
      if (song && onSongLoaded) onSongLoaded(song)
    })
  }
  const handleFileSelect = (file: File) => {
    onFileSelect(file)
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
        <div className={styles.remark}>
          Experimental: You can paste IPFS path/URL here.
        </div>
        <div
          className={styles.dropzone}
          data-hover={hover}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {log ? (
            <LogTextarea log={log} />
          ) : (
            <div className={styles.dropzoneHint}>
              Drop BMS folder here.
              <label className={styles.dropzoneInputLabel}>
                <input
                  type='file'
                  className={styles.dropzoneInput}
                  accept='.zip,.7z,.rar'
                  ref={dropzoneInput}
                  onChange={() => {
                    handleFileSelect(dropzoneInput.current!.files![0])
                  }}
                />
                Select File on Device.
              </label>
            </div>
          )}
        </div>
      </div>
    </Panel>
  )
}

const LogTextarea = ({ log }: { log: string[] }): JSX.Element => {
  return log.length ? (
    <div className={styles.log}>
      {log.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
    </div>
  ) : (
    <div className={styles.log}>
      <p>Omachi kudasai...</p>
    </div>
  )
}

export default CustomBMS
