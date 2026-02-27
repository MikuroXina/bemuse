import { Observable } from '@bemuse/utils/observable.js'
import { useEffect, useState } from 'react'

import styles from './LoadingSceneProgress.module.scss'
import LoadingSceneProgressBar from './LoadingSceneProgressBar.js'

const Item = ({ text, progressText, progress }: TaskItem) => {
  const width = Math.round(progress * 100 || 0).toString() + '%'
  const extra = progressText ? ` (${progressText})` : ''
  return (
    <div key={text}>
      <div className={styles.progressBar}>
        <LoadingSceneProgressBar width={width} />
      </div>
      {text}
      <span className={styles.extra}>{extra}</span>
    </div>
  )
}

export interface TaskItem {
  text: string
  progressText: string
  progress: number
}

export type Tasks = Observable<TaskItem[]>

export interface LoadingSceneProgressProps {
  tasks: Tasks
}

const LoadingSceneProgress = ({ tasks }: LoadingSceneProgressProps) => {
  const [, updater] = useState(false)
  const forceUpdate = () => updater((flag) => !flag)

  useEffect(() => {
    const unsubscribe = tasks.watch(forceUpdate)
    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <div className={styles.container}>
      {tasks.value?.map((task) => (
        <Item key={task.text} {...task} />
      ))}
    </div>
  )
}

export default LoadingSceneProgress
