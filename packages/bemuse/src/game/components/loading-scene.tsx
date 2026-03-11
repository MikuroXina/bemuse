import Scene from '@bemuse/components/common/scene.js'
import type { ChartInfo } from '@mikuroxina/bemuse-types'
import delay from 'delay'
import { useEffect, useRef } from 'react'

import styles from './loading-scene.module.scss'
import LoadingSceneProgress, { type Tasks } from './loading-scene-progress.js'
import LoadingSceneSongInfo from './loading-scene-song-info.js'

export interface LoadingSceneProps {
  song: ChartInfo
  tasks: Tasks
  eyecatchImagePromise?: PromiseLike<HTMLImageElement | null>
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
        if (image) {
          eyecatchRef.current?.appendChild(image)
        }
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
    <Scene className={styles.container} ref={sceneRef}>
      <div className={styles.image} ref={eyecatchRef} />
      <div className={styles.info}>
        <LoadingSceneSongInfo song={song} />
      </div>
      <LoadingSceneProgress tasks={tasks} />
      <div className={styles.flash} />
      <div className={styles.cover} />
    </Scene>
  )
}

export default LoadingScene
