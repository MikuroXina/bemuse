import { useEffect, useState } from 'react'

import type { TaskItem } from '../loaders/multitasker'
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

export type Tasks = () => TaskItem[]

export interface LoadingSceneProgressProps {
  tasks: Tasks
}

const LoadingSceneProgress = ({ tasks }: LoadingSceneProgressProps) => {
  const [taskItems, setTaskItems] = useState<TaskItem[]>([])
  useEffect(() => {
    let id = requestAnimationFrame(updateTasks)
    function updateTasks() {
      setTaskItems(tasks())
      id = requestAnimationFrame(updateTasks)
    }
    return () => {
      cancelAnimationFrame(id)
    }
  }, [tasks])

  return (
    <div className={styles.container}>
      {taskItems.map((task) => (
        <Item key={task.text} {...task} />
      ))}
    </div>
  )
}

export default LoadingSceneProgress
