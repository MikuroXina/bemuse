import styles from './ResultGrade.module.scss'

const ResultGrade = ({ grade }: { grade: string }) => (
  <div className={styles.container}>
    <div className={styles.label}>GRADE</div>
    <div className={styles.grade}>{grade}</div>
  </div>
)

export default ResultGrade
