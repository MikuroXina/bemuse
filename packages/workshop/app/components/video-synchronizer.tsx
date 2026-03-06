import { Button } from '@ui5/webcomponents-react/Button'
import { useRef, useState } from 'react'

import { useFileObjectUrl } from '~/lib/hooks/file-object-url'

export interface VideoSynchronizerProps {
  directoryHandle: FileSystemDirectoryHandle
  songOgg: string
  videoPath: string | undefined
  videoOffset: number
  setVideoOffset: (offset: number) => void
}

export const VideoSynchronizer = ({
  directoryHandle,
  songOgg,
  videoPath,
  videoOffset,
  setVideoOffset,
}: VideoSynchronizerProps) => {
  const [videoUrl, error] = useFileObjectUrl(directoryHandle, videoPath)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canceled = useRef(false)
  const [previewing, setPreviewing] = useState(false)

  function startPreview() {
    const video = videoRef.current
    const audio = audioRef.current
    if (!video || !audio) {
      return
    }
    canceled.current = false
    video.currentTime = 0
    audio.currentTime = 0
    audio.play()
    setTimeout(() => {
      if (!canceled.current) {
        video?.play()
      }
    }, videoOffset * 1000)
    setPreviewing(true)
  }
  function resetPreview() {
    const video = videoRef.current
    video?.pause()

    const audio = audioRef.current
    audio?.pause()

    canceled.current = true
    setPreviewing(false)
  }
  async function setOffset() {
    const offset = prompt('New offset', `${videoOffset}`)
    if (offset == null) {
      return
    }
    const offsetNumber = parseFloat(offset)
    if (isNaN(offsetNumber)) {
      alert('Please enter a number')
      return
    }
    if (offsetNumber < 0) {
      alert('Please enter a positive number')
      return
    }
    setVideoOffset(offsetNumber)
  }

  if (error) {
    return (
      <>
        Unable to load {videoPath}: {error}
      </>
    )
  }
  if (videoUrl === null) {
    return 'Loading vide'
  }
  if (videoUrl === '') {
    return 'Not specified'
  }
  return (
    <>
      <video
        src={videoUrl}
        preload='auto'
        style={{ width: '100%' }}
        muted
        ref={videoRef}
      />
      <audio src={songOgg} preload='auto' ref={audioRef} />
      {previewing ? (
        <Button design='Emphasized' onClick={resetPreview}>
          Stop
        </Button>
      ) : (
        <>
          <Button onClick={setOffset}>
            Set video offset ({videoOffset.toFixed(2)}s)
          </Button>
          <Button design='Emphasized' onClick={startPreview}>
            Test synchronization
          </Button>
        </>
      )}
    </>
  )
}
