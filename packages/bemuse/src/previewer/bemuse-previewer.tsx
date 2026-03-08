import { showAlert, showQuickPick } from '@bemuse/components/dialog/index.js'
import throttle from 'lodash/throttle'
import { useEffect, useReducer, useRef, useState } from 'react'

import styles from './bemuse-previewer.module.scss'
import {
  createNullNotechartPreview,
  type NotechartPreview,
  type NotechartPreviewPlayer,
} from './notechart-preview.js'
import { PreviewCanvas } from './preview-canvas.js'
import { PreviewFileDropHandler } from './preview-file-drop-handler.js'
import { PreviewInfo } from './preview-info.js'
import { PreviewKeyHandler } from './preview-key-handler.js'
import {
  getSavedPreviewInfo,
  loadPreview,
  setPreview,
} from './preview-loader.js'
import {
  type PreviewAction,
  type PreviewState,
  previewStateReducer,
} from './preview-state.js'

export const BemusePreviewer = () => {
  const div = useRef<HTMLDivElement>(null)
  const [previewState, dispatch] = useReducer(previewStateReducer, {
    currentTime: 0,
    hiSpeed: 1,
    playing: false,
  })

  const [notechartPreview, setNotechartPreview] = useState(
    createNullNotechartPreview
  )

  const [loading, setLoading] = useState<null | string>(null)

  const reload = () => {
    setLoading('Loading...')
    const setLoadingDebounced = throttle(setLoading, 100)
    loadPreview({
      log: (message) => {
        setLoadingDebounced((x) => (x != null ? message : x))
      },
    })
      .then((preview) => {
        setNotechartPreview(preview)
        dispatch({ loaded: true })
        if (div.current) {
          div.current.focus()
        }
      })
      .catch((error) => {
        console.error(error)
        showAlert('Error loading preview', String(error))
      })
      .finally(() => setLoadingDebounced(null))
  }

  usePreviewPlayer(previewState, dispatch, notechartPreview)

  useEffect(() => {
    ;(async () => {
      const savedPreviewInfo = await getSavedPreviewInfo()
      if (savedPreviewInfo) {
        const choices: { label: string; action: () => void }[] = [
          {
            label: `Load ${savedPreviewInfo.chartFilename}`,
            action: () => {
              reload()
            },
          },
          {
            label: 'Do not load',
            action: () => {},
          },
        ]
        const chosenChoice = await showQuickPick(choices, {
          title: 'Load a recent song?',
        })
        chosenChoice.action()
      }
    })()
  }, [])

  const onDrop = async (
    handle: FileSystemDirectoryHandle,
    selectedChartFilename: string
  ) => {
    await setPreview(handle, selectedChartFilename)
    reload()
  }

  const onReload = () => {
    reload()
  }

  return (
    <div className={styles.container} tabIndex={0} ref={div}>
      <div className={styles.header}>
        <h1>
          <a
            href='https://bemuse.pages.dev/project/docs/previewer.html'
            target='_blank'
            rel='noreferrer'
          >
            <strong>Bemuse</strong>’s BMS/bmson previewer
          </a>
        </h1>
      </div>
      <div className={styles.main}>
        <PreviewCanvas
          notechartPreview={notechartPreview}
          previewState={previewState}
        />
        <PreviewInfo
          notechartPreview={notechartPreview}
          previewState={previewState}
        />
        <PreviewFileDropHandler onDrop={onDrop} />
        <PreviewKeyHandler
          notechartPreview={notechartPreview}
          dispatch={dispatch}
          onReload={onReload}
        />
      </div>
      {loading != null ? <div className={styles.loading}>{loading}</div> : null}
    </div>
  )
}

function usePreviewPlayer(
  state: PreviewState,
  dispatch: React.Dispatch<PreviewAction>,
  notechartPreview: NotechartPreview
) {
  const playerRef = useRef<NotechartPreviewPlayer | null>(null)

  useEffect(() => {
    if (state.playing && playerRef.current === null) {
      playerRef.current = notechartPreview.play({
        startTime: state.currentTime,
        onFinish: () => {
          dispatch({ playFinish: true })
        },
        onTimeUpdate: (t) => {
          dispatch({ updateTime: { time: t } })
        },
      })
    } else if (!state.playing && playerRef.current !== null) {
      playerRef.current.stop()
      playerRef.current = null
    }
  }, [state])
}
