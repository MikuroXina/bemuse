import { useEffect, useRef, useState } from 'react'

import { MusicPreviewer } from './index.js'

export const useMusicPreviewer = () => {
  const previewerRef = useRef<MusicPreviewer | null>(null)
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
      previewerRef.current?.disable()
      removeEventListener('message', handleMessage)
    }
  }, [])
  useEffect(() => {
    if (pausedForCalibration) {
      previewerRef.current?.disable()
    } else {
      previewerRef.current?.enable()
    }
  }, [pausedForCalibration])

  if (previewerRef.current === null) {
    previewerRef.current = new MusicPreviewer()
  }

  return previewerRef.current
}
