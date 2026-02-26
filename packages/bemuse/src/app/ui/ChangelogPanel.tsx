import Markdown from '@bemuse/ui/Markdown.js'
import Panel from '@bemuse/ui/Panel.js'
import { useEffect, useState } from 'react'

import styles from './ChangelogPanel.module.scss'

type Status =
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'completed'; changelog: string }

const getMarkdown = (status: Status) => {
  const releasesPage =
    '[releases page on GitHub](https://github.com/bemusic/bemuse/releases)'
  if (status.state === 'loading') {
    return 'Omachi kudasai…'
  }
  if (status.state === 'error') {
    return (
      '__Unable to load the change log :(__\n\n' +
      'You can view the change log at the ' +
      releasesPage
    )
  }
  const changelog = status.changelog
  const seeMore =
    '# Older Versions\n\n' +
    'The change log for older versions are available at the ' +
    releasesPage
  return changelog + '\n\n' + seeMore
}

const ChangelogPanel = () => {
  const [status, setStatus] = useState<Status>({ state: 'loading' })
  useEffect(() => {
    ;(async () => {
      const { default: changelog } = await import('@bemuse/../CHANGELOG.md?raw')
      setStatus({ state: 'completed', changelog })
    })().catch(() => {
      setStatus({ state: 'error' })
    })
  }, [])

  return (
    <Panel className='ChangelogPanel' title='What’s New'>
      <div className={styles.content}>
        <Markdown source={getMarkdown(status)} safe />
      </div>
    </Panel>
  )
}

export default ChangelogPanel
