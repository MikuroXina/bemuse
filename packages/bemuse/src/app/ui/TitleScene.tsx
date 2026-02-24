import './TitleScene.scss'

import { SceneManagerContext } from '@bemuse/scene-manager/index.js'
import HomePage from '@bemuse/site/HomePage.js'
import ModalPopup from '@bemuse/ui/ModalPopup.js'
import Scene from '@bemuse/ui/Scene.js'
import { buildName, version } from '@bemuse/utils/build-define.js'
import { type MouseEvent, useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectOptions } from '../../redux/ReduxState.js'
import * as Analytics from '../analytics.js'
import { lastSeenVersion, optionsSlice } from '../entities/Options.js'
import AboutScene from './AboutScene.js'
import ChangelogPanel from './ChangelogPanel.js'
import logo from './images/logo-with-shadow.svg'
import ModeSelectScene from './ModeSelectScene.js'
import Toolbar, { item, spacer } from './Toolbar.js'

const HAS_PARENT = (() => {
  try {
    return window.parent !== window
  } catch {
    return false
  }
})()

const Version = () => (
  <>
    <strong>{buildName}</strong> v{version}
  </>
)

const toolbarItems = ({
  showAbout,
  viewChangelog,
  hasSeenChangelog,
}: {
  showAbout: (e: MouseEvent<HTMLAnchorElement>) => void
  viewChangelog: (e: MouseEvent<HTMLAnchorElement>) => void
  hasSeenChangelog: boolean
}) => [
  item('About', {
    onClick: showAbout,
  }),
  item('Community FAQ', {
    href: 'https://faq.bemuse.ninja',
    tip: 'New',
    tipFeatureKey: 'faq',
  }),
  item('Docs', {
    href: '/project/',
  }),
  item(<Version />, {
    onClick: viewChangelog,
    tip: 'What’s new?',
    tipVisible: !hasSeenChangelog,
  }),
  spacer(),
  item('Discord', {
    href: 'https://discord.gg/aB6ucmx',
    tip: 'Join our community',
    tipFeatureKey: 'discord',
  }),
  item('Twitter', {
    href: 'https://twitter.com/bemusegame',
  }),
  item('GitHub', {
    href: 'https://github.com/bemusic/bemuse',
  }),
]

const TitleScene = () => {
  const sceneManager = useContext(SceneManagerContext)
  const dispatch = useDispatch()
  const options = useSelector(selectOptions)

  const onMarkChangelogAsSeen = () => {
    dispatch(
      optionsSlice.actions.UPDATE_LAST_SEEN_VERSION({ newVersion: version })
    )
  }

  const hasSeenChangelog = lastSeenVersion(options) === version

  const [changelogModalVisible, setChangelogModalVisible] = useState(false)

  const enterGame = () => {
    sceneManager.push(<ModeSelectScene />)
    Analytics.send('TitleScene', 'enter game')
  }

  const showAbout = () => {
    sceneManager.push(<AboutScene />)
    Analytics.send('TitleScene', 'show about')
  }

  const viewChangelog = () => {
    toggleChangelogModal()
    onMarkChangelogAsSeen()
    Analytics.send('TitleScene', 'view changelog')
  }

  const toggleChangelogModal = () => {
    setChangelogModalVisible((flag) => !flag)
  }

  const shouldShowHomepage = !HAS_PARENT
  return (
    <Scene className='TitleScene'>
      <div className='TitleSceneのimage' />
      <div className='TitleSceneのpage'>
        <div className='TitleSceneのpageTitle'>
          <div className='TitleSceneのlogo'>
            <div className='TitleSceneのtagline'>
              online, web-based rhythm game
            </div>
            <img src={logo} />
          </div>
          <div className='TitleSceneのenter'>
            <a onClick={enterGame} data-testid='enter-game'>
              Enter Game
            </a>
          </div>
        </div>
        {shouldShowHomepage ? (
          <div className='TitleSceneのpageContents'>
            <HomePage />
          </div>
        ) : null}
      </div>
      <Toolbar
        items={toolbarItems({ hasSeenChangelog, showAbout, viewChangelog })}
      />
      <div className='TitleSceneのcurtain' />
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
