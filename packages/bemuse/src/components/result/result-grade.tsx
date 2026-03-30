import { faRobot } from '@fortawesome/free-solid-svg-icons/faRobot'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import styles from './result-grade.module.scss'

const ResultGrade = ({ grade }: { grade: string }) => (
  <div className={styles.container}>
    <div className={styles.grade}>
      {grade === 'AUTOPLAY' ? (
        <FontAwesomeIcon icon={faRobot} size='7x' />
      ) : (
        <svg className={styles.gradeTextBox} viewBox='0 0 10 10'>
          <text
            x='50%'
            y='50%'
            dominantBaseline='central'
            textAnchor='middle'
            fill='#ff9'
          >
            {grade}
          </text>
        </svg>
      )}
    </div>
    <div className={styles.label}>GRADE</div>
  </div>
)

export default ResultGrade
