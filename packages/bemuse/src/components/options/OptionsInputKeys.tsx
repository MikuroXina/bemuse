import range from 'lodash/range'

import OptionsInputKey from './OptionsInputKey.js'
import styles from './OptionsInputKeys.module.scss'

export interface OptionsInputKeysProps {
  texts: Record<string, string>
  editing: string | null
  onEdit: (text: string) => void
  keyboardMode: boolean
}

const OptionsInputKeys = ({
  texts,
  editing,
  onEdit,
  keyboardMode,
}: OptionsInputKeysProps) => (
  <div
    className={styles.container}
    data-arrangement={keyboardMode ? 'kb' : 'bm'}
  >
    <div className={styles.keys}>
      {range(1, 8).map((i) => (
        <OptionsInputKey
          className={styles.key}
          n={i}
          key={i}
          text={texts[i]}
          isEditing={'' + i === '' + editing}
          onEdit={() => onEdit('' + i)}
        />
      ))}
    </div>
  </div>
)

export default OptionsInputKeys
