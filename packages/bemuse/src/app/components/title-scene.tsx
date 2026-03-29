import ModalPopup from '@bemuse/components/common/modal-popup.js'
import Scene from '@bemuse/components/common/scene.js'
import { SceneManagerContext } from '@bemuse/scene-manager/index.js'
import HomePage from '@bemuse/site/home-page.js'
import { buildName, version } from '@bemuse/utils/build-define.js'
import { type MouseEvent, useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectOptions } from '../../redux/redux-state.js'
import { lastSeenVersion, optionsSlice } from '../entities/options.js'
import AboutScene from './about-scene.js'
import ChangelogPanel from './changelog-panel.js'
import logo from './images/logo-with-shadow.svg'
import ModeSelectScene from './mode-select-scene.js'
import styles from './title-scene.module.scss'
import Toolbar, { ToolbarItem, ToolbarSeparator } from './toolbar.js'

const HAS_PARENT = (() => {
  try {
    return window.parent !== window
  } catch {
    return false
  }
})()

const Version = () => (
  <>
    <strong>{buildName()}</strong> {version()}
  </>
)

const ToolbarItems = ({
  showAbout,
  viewChangelog,
  hasSeenChangelog,
}: {
  showAbout: (e: MouseEvent<HTMLAnchorElement>) => void
  viewChangelog: (e: MouseEvent<HTMLAnchorElement>) => void
  hasSeenChangelog: boolean
}) => (
  <>
    <ToolbarItem text='About' onClick={showAbout} />
    <ToolbarItem text='Docs' href='/project/' />
    <ToolbarItem text='Workshop' href='/workshop/' />
    <ToolbarItem
      text={<Version />}
      onClick={viewChangelog}
      tip='What’s new?'
      tipVisible={!hasSeenChangelog}
    />
    <ToolbarSeparator />
    <ToolbarItem text='GitHub' href='https://github.com/MikuroXina/bemuse' />
  </>
)

const TitleScene = () => {
  const sceneManager = useContext(SceneManagerContext)
  const dispatch = useDispatch()
  const options = useSelector(selectOptions)

  const onMarkChangelogAsSeen = () => {
    dispatch(
      optionsSlice.actions.UPDATE_LAST_SEEN_VERSION({ newVersion: version() })
    )
  }

  const hasSeenChangelog = lastSeenVersion(options) === version()

  const [changelogModalVisible, setChangelogModalVisible] = useState(false)

  const enterGame = () => {
    sceneManager.push(<ModeSelectScene />)
  }

  const showAbout = () => {
    sceneManager.push(<AboutScene />)
  }

  const viewChangelog = () => {
    toggleChangelogModal()
    onMarkChangelogAsSeen()
  }

  const toggleChangelogModal = () => {
    setChangelogModalVisible((flag) => !flag)
  }

  const shouldShowHomepage = !HAS_PARENT
  return (
    <Scene className={styles.scene}>
      <div className={styles.image} />
      <div className={styles.page}>
        <div className={styles.pageTitle}>
          <div className={styles.logo}>
            <div className={styles.tagline}>online, web-based rhythm game</div>
            <img src={logo} />
          </div>
          <div className={styles.enter}>
            <a onClick={enterGame} data-testid='enter-game'>
              Enter Game
            </a>
          </div>
        </div>
        {shouldShowHomepage ? (
          <div className={styles.pageContents}>
            <HomePage />
          </div>
        ) : null}
      </div>
      <Toolbar>
        <ToolbarItems {...{ hasSeenChangelog, showAbout, viewChangelog }} />
      </Toolbar>
      <div className={styles.curtain} />
      <ModalPopup
        visible={changelogModalVisible}
        onBackdropClick={() => toggleChangelogModal()}
      >
        <ChangelogPanel />
      </ModalPopup>
    </Scene>
  )
}

export default TitleScene
