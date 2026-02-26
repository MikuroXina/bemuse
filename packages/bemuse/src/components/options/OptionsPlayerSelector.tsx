import { memo, type ReactNode } from 'react'

import styles from './OptionsPlayerSelector.module.scss'

export interface OptionsPlayerSelectorProps<T extends string> {
  onSelect: (item: T) => void
  options: readonly {
    label: string
    value: T
  }[]
  defaultValue: T
  Item: (props: { active: boolean; value: T }) => JSX.Element
}

const OptionsPlayerSelectorInner = <T extends string>({
  onSelect,
  options,
  defaultValue,
  Item,
}: OptionsPlayerSelectorProps<T>) => (
  <div className={styles.container}>
    {options.map(({ label, value }, index) => {
      const isActive = value === defaultValue
      return (
        <ItemContainer
          key={index}
          label={label}
          active={isActive}
          onSelect={() => onSelect(value)}
        >
          <Item active={isActive} value={value} />
        </ItemContainer>
      )
    })}
  </div>
)

export const OptionsPlayerSelector = memo(
  OptionsPlayerSelectorInner
) as typeof OptionsPlayerSelectorInner

interface ItemContainerProps {
  active: boolean
  onSelect: () => void
  label: string
  children: ReactNode
}

const ItemContainer = memo(function ItemContainer({
  active,
  onSelect,
  label,
  children,
}: ItemContainerProps) {
  return (
    <div className={styles.item} onClick={onSelect} data-active={active}>
      {children}
      <div className={styles.label}>{label}</div>
    </div>
  )
})
