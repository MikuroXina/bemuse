import TipContainer from '@bemuse/components/common/tip-container.js'
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  type ComponentProps,
  memo,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useState,
} from 'react'

import FirstTimeTip from './first-time-tip.js'
import styles from './toolbar.module.scss'

function openLink(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  window.open(e.currentTarget.href, '_blank')
}

export interface ToolbarItemProps {
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  href?: string
  text: ReactNode
  tip?: ReactNode
  tipFeatureKey?: string
  tipVisible?: boolean
}

export const ToolbarItem = ({
  onClick = openLink,
  href,
  text,
  tip,
  tipFeatureKey,
  tipVisible,
}: ToolbarItemProps) => {
  let content = <>{text}</>
  if (tip) {
    if (tipFeatureKey) {
      content = (
        <FirstTimeTip tip={tip} featureKey={tipFeatureKey}>
          {content}
        </FirstTimeTip>
      )
    } else {
      content = (
        <TipContainer tip={tip} tipVisible={!!tipVisible}>
          {content}
        </TipContainer>
      )
    }
  }
  return (
    <a className={styles.toolBarItem} onClick={onClick} href={href}>
      {content}
    </a>
  )
}

export const ToolbarSeparator = () => <hr className={styles.separator} />

export type ToolbarItemComponents = typeof ToolbarItem | typeof ToolbarSeparator

export type ToolbarItem = ReactElement<ComponentProps<ToolbarItemComponents>>

export default memo(function Toolbar({
  children,
}: {
  children: ToolbarItem | readonly ToolbarItem[]
}) {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <nav className={styles.toolBar} data-visible={visible}>
        {children}
      </nav>
      <button
        className={styles.floatingMobileButton}
        onClick={() => setVisible((flag) => !flag)}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
    </>
  )
})
