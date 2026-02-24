import { Icon } from '@bemuse/fa/index.js'
import TipContainer from '@bemuse/ui/TipContainer.js'
import {
  Fragment,
  memo,
  type MouseEvent,
  type ReactNode,
  useState,
} from 'react'

import FirstTimeTip from './FirstTimeTip.js'
import styles from './Toolbar.module.scss'

export interface ToolbarItemProps {
  type: 'item'
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void
  href?: string
  text: ReactNode
  tip?: ReactNode
  tipFeatureKey?: string
  tipVisible?: boolean
}

export interface ToolbarSpacerProps {
  type: 'spacer'
}

export type ToolbarItems = readonly (ToolbarItemProps | ToolbarSpacerProps)[]

export default memo(function Toolbar({ items }: { items: ToolbarItems }) {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <nav className={styles.toolBar} data-visible={visible}>
        {items.map((element, index) => {
          if (element.type === 'item') {
            return (
              <Fragment key={index}>
                <ToolbarItem item={element} />
              </Fragment>
            )
          } else {
            return (
              <Fragment key={index}>
                <hr className={styles.separator} />
              </Fragment>
            )
          }
        })}
      </nav>
      <button
        className={styles.floatingMobileButton}
        onClick={() => setVisible((flag) => !flag)}
      >
        <Icon name='bars' />
      </button>
    </>
  )
})

function openLink(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  window.open(e.currentTarget.href, '_blank')
}
const defaultOptions = {
  onClick: openLink,
} as const

export const item = (
  text: ReactNode,
  options: Partial<ToolbarItemProps>
): ToolbarItemProps => {
  return {
    type: 'item',
    text,
    ...defaultOptions,
    ...options,
  }
}
export const spacer = (): ToolbarSpacerProps => {
  return { type: 'spacer' }
}

const ToolbarItem = ({ item }: { item: ToolbarItemProps }) => {
  let content = <>{item.text}</>
  if (item.tip) {
    if (item.tipFeatureKey) {
      content = (
        <FirstTimeTip tip={item.tip} featureKey={item.tipFeatureKey}>
          {content}
        </FirstTimeTip>
      )
    } else {
      content = (
        <TipContainer tip={item.tip} tipVisible={!!item.tipVisible}>
          {content}
        </TipContainer>
      )
    }
  }
  return (
    <a className={styles.toolBarItem} onClick={item.onClick} href={item.href}>
      {content}
    </a>
  )
}
