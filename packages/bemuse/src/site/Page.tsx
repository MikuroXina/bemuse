import type { ReactNode } from 'react'

import styles from './Page.module.scss'

export const Page = ({ children }: { children: ReactNode }) => (
  <div className={styles.container}>
    {children}
    <div className={styles.privacy}>
      By playing Bemuse, you agree to allow us to collect
      <br />
      anonymous usage data for the purpose of improving the game.
    </div>
  </div>
)
export default Page

export const Heading = ({ children }: { children: ReactNode }) => (
  <h1 className={styles.heading}>{children}</h1>
)
