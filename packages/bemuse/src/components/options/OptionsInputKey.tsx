import styles from './OptionsInputKey.module.scss'

export interface OptionsInputKeyProps {
  className?: string
  text: string
  n: number
  isEditing: boolean
  onEdit: () => void
}

export const OptionsInputKey = ({
  className = '',
  text,
  n,
  isEditing,
  onEdit,
}: OptionsInputKeyProps) => {
  return (
    <div
      className={`${styles.key} ${className}`}
      data-testid='options-input-key'
      data-n={n}
      data-editing={isEditing ? 'true' : 'false'}
    >
      <div
        className={styles.contents}
        onClick={onEdit}
        data-editing={isEditing}
      >
        <div className={styles.text}>{text}</div>
      </div>
    </div>
  )
}

export default OptionsInputKey
