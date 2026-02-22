import './LoadingScene.scss'

import Scene from '@bemuse/ui/Scene.js'
import type { ChartInfo } from 'bemuse-types'
import delay from 'delay'
import { useEffect, useRef } from 'react'

import LoadingSceneProgress, { Tasks } from './LoadingSceneProgress.js'
import LoadingSceneSongInfo from './LoadingSceneSongInfo.js'

export interface LoadingSceneProps {
  song: ChartInfo
  tasks: Tasks
  eyecatchImagePromise?: PromiseLike<HTMLImageElement>
  registerTeardownCallback?: (callback: () => void) => void
}

const LoadingScene = ({
  song,
  tasks,
  eyecatchImagePromise,
  registerTeardownCallback,
}: LoadingSceneProps) => {
  const sceneRef = useRef<HTMLDivElement | null>(null)
  const eyecatchRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (eyecatchImagePromise) {
      eyecatchImagePromise.then((image) => {
        eyecatchRef.current?.appendChild(image)
      })
    }
    if (registerTeardownCallback) {
      registerTeardownCallback(() => {
        sceneRef.current?.classList.add('is-exiting')
        return delay(500)
      })
    }
  }, [])

  return (
    <Scene className='LoadingScene' ref={sceneRef}>
      <div className='LoadingSceneのimage' ref={eyecatchRef} />
      <div className='LoadingSceneのinfo'>
        <LoadingSceneSongInfo song={song} />
      </div>
      <LoadingSceneProgress tasks={tasks} />
      <div className='LoadingSceneのflash' />
      <div className='LoadingSceneのcover' />
    </Scene>
  )
}

export default LoadingScene
