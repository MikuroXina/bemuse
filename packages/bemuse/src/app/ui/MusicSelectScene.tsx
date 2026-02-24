import './MusicSelectScene.scss'

import type { Chart, Song } from '@bemuse/collection-model/types.js'
import CustomBMS from '@bemuse/components/CustomBMS.js'
import OptionsView from '@bemuse/components/options/Options.js'
import { shouldShowOptions } from '@bemuse/flags/index.js'
import { OFFICIAL_SERVER_URL } from '@bemuse/music-collection/index.js'
import * as MusicPreviewer from '@bemuse/music-previewer/index.js'
import { useCurrentUser } from '@bemuse/online/hooks.js'
import Online, { type UserInfo } from '@bemuse/online/index.js'
import { OnlineContext } from '@bemuse/online/instance.js'
import AuthenticationPopup from '@bemuse/online/ui/AuthenticationPopup.js'
import { SceneManagerContext } from '@bemuse/scene-manager/index.js'
import ModalPopup from '@bemuse/ui/ModalPopup.js'
import Scene from '@bemuse/ui/Scene.js'
import SceneHeading from '@bemuse/ui/SceneHeading.js'
import c from 'classnames'
import { type ChangeEvent, type MouseEvent, useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createSelector, createStructuredSelector } from 'reselect'

import {
  selectChartsForSelectedSong,
  selectCurrentCollectionUrl,
  selectCurrentCorrectionLoadError,
  selectGroups,
  selectIsCurrentCollectionLoading,
  selectOptions,
  selectPlayMode,
  selectSearchInputText,
  selectSearchText,
  selectSelectedChart,
  selectSelectedSong,
} from '../../redux/ReduxState.js'
import * as Options from '../entities/Options.js'
import * as MusicSearchIO from '../io/MusicSearchIO.js'
import * as MusicSelectionIO from '../io/MusicSelectionIO.js'
import { hasPendingArchiveToLoad } from '../PreloadedCustomBMS.js'
import MusicInfo from './MusicInfo.js'
import MusicList from './MusicList.js'
import RageQuitPopup from './RageQuitPopup.js'
import SongPreviewer from './SongPreviewer.js'
import Toolbar, { item, spacer } from './Toolbar.js'
import UnofficialPanel from './UnofficialPanel.js'

const selectMusicSelectState = (() => {
  const selectLegacyServerObjectForCurrentCollection = createSelector(
    selectCurrentCollectionUrl,
    (url) => ({ url })
  )

  const selectIsCurrentCollectionUnofficial = createSelector(
    selectCurrentCollectionUrl,
    (url) => url !== OFFICIAL_SERVER_URL
  )

  return createStructuredSelector({
    loading: selectIsCurrentCollectionLoading,
    error: selectCurrentCorrectionLoadError,
    server: selectLegacyServerObjectForCurrentCollection,
    groups: selectGroups,
    song: selectSelectedSong,
    charts: selectChartsForSelectedSong,
    chart: selectSelectedChart,
    filterText: selectSearchInputText,
    highlight: selectSearchText,
    unofficial: selectIsCurrentCollectionUnofficial,
    playMode: selectPlayMode,
  })
})()
type MusicSelect = ReturnType<typeof selectMusicSelectState>

const UnofficialDisclaimer = ({
  handleUnofficialClick,
}: {
  handleUnofficialClick: () => void
}) => (
  <div
    className='MusicSelectSceneのunofficialLabel'
    onClick={handleUnofficialClick}
  >
    <b>Disclaimer:</b> Unofficial Server
  </div>
)

const Main = ({
  musicSelect,
  inSong,
  handleOptionsOpen,
  handleSongSelect,
  handleMusicListTouch,
  handleChartClick,
}: {
  musicSelect: MusicSelect
  inSong: boolean
  handleOptionsOpen: () => void
  handleSongSelect: (song: Song, chart?: Chart) => void
  handleMusicListTouch: () => void
  handleChartClick: (chart: Chart, e: MouseEvent) => void
}) => {
  if (musicSelect.loading) {
    return <div className='MusicSelectSceneのloading'>Loading…</div>
  }
  if (musicSelect.error) {
    return (
      <div className='MusicSelectSceneのloading'>Cannot load collection!</div>
    )
  }
  if (musicSelect.groups.length === 0) {
    return <div className='MusicSelectSceneのloading'>No songs found!</div>
  }
  return (
    <div
      className={c('MusicSelectSceneのmain', {
        'is-in-song': inSong,
      })}
    >
      <MusicList
        groups={musicSelect.groups}
        highlight={musicSelect.highlight}
        selectedSong={musicSelect.song}
        selectedChart={musicSelect.chart}
        playMode={musicSelect.playMode}
        onSelect={handleSongSelect}
        onTouch={handleMusicListTouch}
      />
      <MusicInfo
        song={musicSelect.song}
        chart={musicSelect.chart}
        charts={musicSelect.charts}
        playMode={musicSelect.playMode}
        onChartClick={handleChartClick}
        onOptions={handleOptionsOpen}
      />
    </div>
  )
}

const getToolbarItems = ({
  online,
  user,
  handleCustomBMSOpen,
  handleAuthenticate,
  handleOptionsOpen,
  handleExit,
}: {
  handleCustomBMSOpen: () => void
  handleAuthenticate: () => void
  handleOptionsOpen: () => void
  handleExit: () => void
  user: UserInfo | null
  online: Online
}) => {
  const handleLogout = () => {
    if (confirm('Do you really want to log out?')) {
      online.logOut()
    }
  }

  const getOnlineToolbarButtons = ({
    handleAuthenticate,
  }: {
    handleAuthenticate: () => void
  }) => {
    if (!online) return []
    if (user) {
      return [
        item(<span>Log Out ({user.username})</span>, {
          onClick: handleLogout,
        }),
      ]
    } else {
      return [
        item('Log In / Create an Account', {
          onClick: handleAuthenticate,
        }),
      ]
    }
  }

  return [
    item('Exit', {
      onClick: handleExit,
    }),
    item('Play Custom BMS', {
      onClick: handleCustomBMSOpen,
    }),
    spacer(),
    ...getOnlineToolbarButtons({ handleAuthenticate }),
    item('Options', {
      onClick: handleOptionsOpen,
    }),
  ]
}

const MusicSelectScene = () => {
  const sceneManager = useContext(SceneManagerContext)
  const musicSelect = useSelector(selectMusicSelectState)
  const collectionUrl = useSelector(selectCurrentCollectionUrl)
  const options = useSelector(selectOptions)
  const musicPreviewEnabled = Options.isPreviewEnabled(options)

  const [optionsVisible, setOptionsVisible] = useState(shouldShowOptions())
  const [customBMSModalVisible, setCustomBMSModalVisible] = useState(
    hasPendingArchiveToLoad()
  )
  const [unofficialDisclaimerVisible, setUnofficialDisclaimerVisible] =
    useState(false)
  const [inSong, setInSong] = useState(false)
  const [authenticationPopupVisible, setAuthenticationPopupVisible] =
    useState(false)

  const dispatch = useDispatch()
  const online = useContext(OnlineContext)
  const user = useCurrentUser()

  const popScene = () => {
    sceneManager.pop()
  }
  const onSelectChart = (song: Song, chart: Chart) =>
    MusicSelectionIO.selectChart(song, chart, dispatch)
  const onSelectSong = (song: Song) =>
    MusicSelectionIO.selectSong(song, dispatch)
  const onFilterTextChange = (text: string) =>
    MusicSearchIO.handleSearchTextType(text, dispatch)
  const onLaunchGame = (extraOptions: { autoplayEnabled: boolean }) =>
    MusicSelectionIO.launchGame({
      server: musicSelect.server,
      song: musicSelect.song,
      chart: musicSelect.chart,
      dispatch,
      options,
      sceneManager,
      ...extraOptions,
    })

  const showUnofficialDisclaimer = () => {
    setUnofficialDisclaimerVisible(true)
  }
  const hideUnofficialDisclaimer = () => {
    setUnofficialDisclaimerVisible(false)
  }
  const showCustomBMSModal = () => {
    setCustomBMSModalVisible(true)
  }
  const hideCustomBMSModal = () => {
    setCustomBMSModalVisible(false)
  }
  const handleFilter = (e: ChangeEvent<HTMLInputElement>) => {
    onFilterTextChange(e.target.value)
  }
  const showOptions = () => {
    setOptionsVisible(true)
  }
  const hideOptions = () => {
    setOptionsVisible(false)
  }
  const showAuthenticationPopup = () => {
    setAuthenticationPopupVisible(true)
  }
  const hideAuthenticationPopup = () => {
    setAuthenticationPopupVisible(false)
  }
  const handleSongSelect = (song: Song, chart?: Chart) => {
    if (chart) {
      onSelectChart(song, chart)
    } else {
      onSelectSong(song)
    }
    setInSong(true)
  }

  const handleMusicListTouch = () => {
    setInSong(false)
  }

  const handleChartClick = (chart: Chart, e: MouseEvent) => {
    if (musicSelect.chart.md5 === chart.md5) {
      MusicPreviewer.go()
      onLaunchGame({
        autoplayEnabled: e.altKey,
      })
    } else {
      onSelectChart(musicSelect.song, chart)
    }
  }

  return (
    <Scene className='MusicSelectScene' onDragEnter={showCustomBMSModal}>
      <SceneHeading>
        Select Music
        <input
          type='text'
          placeholder='Filter…'
          className='MusicSelectSceneのsearch'
          onChange={handleFilter}
          value={musicSelect.filterText}
        />
      </SceneHeading>

      {musicSelect.unofficial ? (
        <UnofficialDisclaimer
          handleUnofficialClick={showUnofficialDisclaimer}
        />
      ) : null}

      <Main
        musicSelect={musicSelect}
        inSong={inSong}
        handleOptionsOpen={showOptions}
        handleChartClick={handleChartClick}
        handleMusicListTouch={handleMusicListTouch}
        handleSongSelect={handleSongSelect}
      />

      <Toolbar
        items={getToolbarItems({
          handleAuthenticate: showAuthenticationPopup,
          handleCustomBMSOpen: showCustomBMSModal,
          handleOptionsOpen: showOptions,
          handleExit: popScene,
          online,
          user: user ?? null,
        })}
      />

      <ModalPopup visible={optionsVisible} onBackdropClick={hideOptions}>
        <OptionsView onClose={hideOptions} />
      </ModalPopup>

      <ModalPopup
        visible={customBMSModalVisible}
        onBackdropClick={hideCustomBMSModal}
      >
        <div className='MusicSelectSceneのcustomBms'>
          <CustomBMS onSongLoaded={hideCustomBMSModal} />
        </div>
      </ModalPopup>

      <ModalPopup
        visible={unofficialDisclaimerVisible}
        onBackdropClick={hideUnofficialDisclaimer}
      >
        <UnofficialPanel onClose={hideUnofficialDisclaimer} />
      </ModalPopup>

      <AuthenticationPopup
        visible={authenticationPopupVisible}
        onFinish={hideAuthenticationPopup}
        onBackdropClick={hideAuthenticationPopup}
      />

      <RageQuitPopup />

      {musicPreviewEnabled && (
        <SongPreviewer song={musicSelect.song} serverUrl={collectionUrl} />
      )}
    </Scene>
  )
}

export default MusicSelectScene
