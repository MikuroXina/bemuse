import styles from './LoadingSceneProgressBar.module.scss'

export interface LoadingSceneProgressBarProps {
  width: string | number
}

const LoadingSceneProgressBar = ({ width }: LoadingSceneProgressBarProps) => (
  <div className={styles.container}>
    <div className={styles.bar} style={{ width }} />
  </div>
)

export default LoadingSceneProgressBar
