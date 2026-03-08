import styles from './color-list.module.css'

export interface ColorDef {
  id: string
  color: string
  dark?: true
}

export const ColorList = ({ colors }: { colors: readonly ColorDef[] }) => (
  <ul className={styles.container}>
    {colors.map((color) => (
      <li key={color.id} className={styles.item}>
        <strong
          className={styles.name}
          data-dark={color.dark}
          style={{ background: color.color }}
        >
          {color.id}
        </strong>
        &nbsp;
        <code className={styles.colorCode}>{color.color}</code>
      </li>
    ))}
  </ul>
)
