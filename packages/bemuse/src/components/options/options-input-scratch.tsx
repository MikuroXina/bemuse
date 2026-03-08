import styles from './OptionsInputScratch.module.scss'

export interface OptionsInputScratchProps {
  text: readonly [string, string]
  editIndex: number
  isEditing: boolean
  onEdit: (text: string) => void
}

const OptionsInputScratch = ({
  text,
  editIndex,
  isEditing,
  onEdit,
}: OptionsInputScratchProps) => (
  <div
    className={styles.container}
    data-editing={isEditing}
    onClick={() => onEdit('SC')}
  >
    <svg viewBox='-100 -100 200 200'>
      <path d={star()} className={styles.star} />
    </svg>
    <div className={styles.text}>
      <div className={styles.key} data-editing={editIndex === 0}>
        {text[0]}
      </div>
      <div className={styles.keySeparator}>or</div>
      <div className={styles.key} data-editing={editIndex === 1}>
        {text[1]}
      </div>
    </div>
  </div>
)

export default OptionsInputScratch

function star() {
  let out = ''
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 40 : 90
    const θ = (i * Math.PI) / 5
    const x = Math.sin(θ) * r
    const y = Math.cos(θ) * r
    out += (i === 0 ? 'M' : ' L') + x + ',' + y
  }
  return out
}
