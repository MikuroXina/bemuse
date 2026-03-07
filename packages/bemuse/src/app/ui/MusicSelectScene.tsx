import type { Chart, Song } from '@bemuse/collection-model/types.js'
import CustomBMS from '@bemuse/components/CustomBMS.js'
import OptionsView from '@bemuse/components/options/Options.js'
import { shouldShowOptions } from '@bemuse/flags/index.js'
import filterSongs from '@bemuse/music-collection/filterSongs.js'
import getPlayableCharts from '@bemuse/music-collection/getPlayableCharts.js'
import groupSongsIntoCategories from '@bemuse/music-collection/groupSongsIntoCategories.js'
import sortSongs from '@bemuse/music-collection/sortSongs.js'
import { useCurrentUser } from '@bemuse/online/hooks.js'
import Online, { type UserInfo } from '@bemuse/online/index.js'
import { OnlineContext } from '@bemuse/online/instance.js'
import AuthenticationPopup from '@bemuse/online/ui/AuthenticationPopup.js'
import { OFFICIAL_SERVER_URL, useCollection } from '@bemuse/query/collection.js'
import { SceneManagerContext } from '@bemuse/scene-manager/index.js'
import ModalPopup from '@bemuse/ui/ModalPopup.js'
import Scene from '@bemuse/ui/Scene.js'
import SceneHeading from '@bemuse/ui/SceneHeading.js'
import type { SongMetadataInCollection } from '@mikuroxina/bemuse-types'
import {
  type ChangeEvent,
  type MouseEvent,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import {
  customSongsSlice,
  selectCustomSongs,
  selectMusicSelection,
  selectOptions,
  selectPlayMode,
  selectSearchInputText,
  selectSearchText,
} from '../../redux/ReduxState.js'
import { searchText } from '../entities/MusicSearchText.js'
import {
  musicSelectionSlice,
  selectedChartGivenCharts,
  selectedSongGivenSongs,
} from '../entities/MusicSelection.js'
import * as Options from '../entities/Options.js'
import findMatchingSong from '../interactors/findMatchingSong.js'
import * as MusicSearchIO from '../io/MusicSearchIO.js'
import * as MusicSelectionIO from '../io/MusicSelectionIO.js'
import { hasPendingArchiveToLoad } from '../PreloadedCustomBMS.js'
import { getInitiallySelectedSong, getMusicServer } from '../query-flags.js'
import MusicInfo from './MusicInfo.js'
import MusicList from './MusicList.js'
import styles from './MusicSelectScene.module.scss'
import RageQuitPopup from './RageQuitPopup.js'
import SongPreviewer from './SongPreviewer.js'
import Toolbar, { item, spacer } from './Toolbar.js'
import UnofficialPanel from './UnofficialPanel.js'

const selectMusicSelectState = createStructuredSelector({
  filterText: selectSearchInputText,
  highlight: selectSearchText,
  playMode: selectPlayMode,
})
type MusicSelect = ReturnType<typeof selectMusicSelectState>

const UnofficialDisclaimer = ({
  handleUnofficialClick,
}: {
  handleUnofficialClick: () => void
}) => (
  <div className={styles.unofficialLabel} onClick={handleUnofficialClick}>
    <b>Disclaimer:</b> Unofficial Server
  </div>
)

const Main = ({
  serverUrl,
  musicSelect,
  inSong,
  handleOptionsOpen,
  handleSongSelect,
  handleSongDeselect,
}: {
  serverUrl: string
  musicSelect: MusicSelect
  inSong: boolean
  handleOptionsOpen: () => void
  handleSongSelect: (song: Song, chart?: Chart) => void
  handleSongDeselect: () => void
}) => {
  const dispatch = useDispatch()
  const sceneManager = useContext(SceneManagerContext)
  const musicSelection = useSelector(selectMusicSelection)
  const customSongs = useSelector(selectCustomSongs)
  const collectionRes = useCollection(serverUrl)
  const options = useSelector(selectOptions)
  const musicPreviewEnabled = Options.isPreviewEnabled(options)

  const [songs, selectGroups] = useMemo(() => {
    if (collectionRes.data == null) {
      return [[], []]
    }

    const collectionData = collectionRes.data
    const allSongs = customSongs.concat(collectionData.songs)
    const songList = sortSongs(allSongs)
    const selectFilteredSongList = filterSongs(songList, searchText)
    const songOfTheDayEnabled = collectionData.songOfTheDayEnabled
    const selectGroups = groupSongsIntoCategories(selectFilteredSongList, {
      songOfTheDayEnabled,
    })

    const initiallySelectedSong = getInitiallySelectedSong()
    if (initiallySelectedSong) {
      const matchingSong = findMatchingSong({
        songs: allSongs,
        getTitle: (song: SongMetadataInCollection) => song.title,
        title: initiallySelectedSong,
      })
      if (matchingSong) {
        dispatch(
          musicSelectionSlice.actions.MUSIC_SONG_SELECTED({
            songId: matchingSong.id,
          })
        )
      }
    }

    return [allSongs, selectGroups]
  }, [collectionRes.data])

  const selectedSong = selectedSongGivenSongs(songs)(musicSelection)
  const selectedSongCharts = getPlayableCharts(selectedSong.charts)
  const selectedChart =
    selectedChartGivenCharts(selectedSongCharts)(musicSelection)

  function onClickChart(chart: Chart, e: MouseEvent) {
    if (selectedChart.md5 === chart.md5) {
      MusicSelectionIO.launchGame({
        server: { url: serverUrl },
        song: selectedSong,
        chart: selectedChart,
        dispatch,
        options,
        sceneManager,
        autoplayEnabled: e.altKey,
      })
    } else {
      handleSongSelect(selectedSong, chart)
    }
  }

  if (collectionRes.isLoading || collectionRes.isPending) {
    return <div className={styles.loading}>Loading…</div>
  }
  if (collectionRes.isError) {
    return <div className={styles.loading}>Cannot load collection!</div>
  }

  if (selectGroups.length === 0) {
    return <div className={styles.loading}>No songs found!</div>
  }
  return (
    <div className={styles.main} data-in-song={inSong}>
      <MusicList
        groups={selectGroups}
        highlight={musicSelect.highlight}
        selectedSong={selectedSong}
        selectedChart={selectedChart}
        playMode={musicSelect.playMode}
        onSelect={handleSongSelect}
        onDeselect={handleSongDeselect}
      />
      <MusicInfo
        song={selectedSong}
        chart={selectedChart}
        charts={selectedSongCharts}
        playMode={musicSelect.playMode}
        onChartClick={onClickChart}
        onOptions={handleOptionsOpen}
        serverUrl={serverUrl}
      />
      {musicPreviewEnabled && (
        <SongPreviewer song={selectedSong} serverUrl={serverUrl} />
      )}
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
  const serverUrl: string = getMusicServer() || OFFICIAL_SERVER_URL

  const sceneManager = useContext(SceneManagerContext)
  const musicSelect = useSelector(selectMusicSelectState)

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
  const onSongLoaded = (song: Song) => {
    dispatch(customSongsSlice.actions.CUSTOM_SONG_LOADED({ song }))
    hideCustomBMSModal()
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

  const handleSongDeselect = () => {
    setInSong(false)
  }

  return (
    <Scene className={styles.scene} onDragEnter={showCustomBMSModal}>
      <SceneHeading className={styles.heading}>
        Select Music
        <input
          type='text'
          placeholder='Filter…'
          className={styles.search}
          onChange={handleFilter}
          value={musicSelect.filterText}
        />
      </SceneHeading>

      {serverUrl !== OFFICIAL_SERVER_URL && (
        <UnofficialDisclaimer
          handleUnofficialClick={showUnofficialDisclaimer}
        />
      )}

      <Main
        serverUrl={serverUrl}
        musicSelect={musicSelect}
        inSong={inSong}
        handleOptionsOpen={showOptions}
        handleSongDeselect={handleSongDeselect}
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
        <div className={styles.customBms}>
          <CustomBMS onSongLoaded={onSongLoaded} />
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
    </Scene>
  )
}

export default MusicSelectScene
