import { useEffect, useState } from 'react'

import * as MusicPreviewer from './index.js'

MusicPreviewer.preload()

export interface MusicSelectPreviewerProps {
  url: string | null
}

const MusicSelectPreviewer = ({ url }: MusicSelectPreviewerProps) => {
  const [pausedForCalibration, setPausedForCalibration] = useState(false)
  useEffect(() => {
    const handleMessage = ({ data }: MessageEvent) => {
      if (data.type === 'calibration-started') {
        setPausedForCalibration(true)
      }
      if (data.type === 'calibration-closed') {
        setPausedForCalibration(false)
      }
    }
    addEventListener('message', handleMessage)
    return () => {
      MusicPreviewer.disable()
      removeEventListener('message', handleMessage)
    }
  }, [])
  useEffect(() => {
    if (pausedForCalibration) {
      MusicPreviewer.disable()
    } else {
      MusicPreviewer.enable()
    }
    MusicPreviewer.preview(url)
  }, [url, pausedForCalibration])

  return null
}

export default MusicSelectPreviewer
