import type { Chart, Song } from '@bemuse/collection-model/types.js'
import ModalPopup from '@bemuse/components/common/modal-popup.js'
import Scene from '@bemuse/components/common/scene.js'
import SceneHeading from '@bemuse/components/common/scene-heading.js'
import CustomBMS from '@bemuse/components/custom-bms.js'
import OptionsView from '@bemuse/components/options/options.js'
import { shouldShowOptions } from '@bemuse/flags/index.js'
import filterSongs from '@bemuse/music-collection/filter-songs.js'
import getPlayableCharts from '@bemuse/music-collection/get-playable-charts.js'
import getPreviewResourceUrl from '@bemuse/music-collection/get-preview-resource-url.js'
import groupSongsIntoCategories from '@bemuse/music-collection/group-songs-into-categories.js'
import sortSongs from '@bemuse/music-collection/sort-songs.js'
import { useMusicPreviewer } from '@bemuse/music-previewer/hook.js'
import AuthenticationPopup from '@bemuse/online/components/authentication-popup.js'
import { useCurrentUser, useLogOutMutation } from '@bemuse/online/index.js'
import { OFFICIAL_SERVER_URL, useCollection } from '@bemuse/query/collection.js'
import { SceneManagerContext } from '@bemuse/scene-manager/index.js'
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
} from '../../redux/redux-state.js'
import {
  musicSelectionSlice,
  selectedChartGivenCharts,
  selectedSongGivenSongs,
} from '../entities/music-selection.js'
import * as Options from '../entities/options.js'
import findMatchingSong from '../interactors/find-matching-song.js'
import * as MusicSearchIO from '../io/music-search-io.js'
import * as MusicSelectionIO from '../io/music-selection-io.js'
import { hasPendingArchiveToLoad } from '../preloaded-custom-bms.js'
import { getInitiallySelectedSong, getMusicServer } from '../query-flags.js'
import MusicInfo from './music-info.js'
import MusicList from './music-list.js'
import styles from './music-select-scene.module.scss'
import RageQuitPopup from './rage-quit-popup.js'
import Toolbar, { ToolbarItem, ToolbarSeparator } from './toolbar.js'
import UnofficialPanel from './unofficial-panel.js'

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
  const collectionRes = useCollection(serverUrl)
  const musicSelection = useSelector(selectMusicSelection)
  const customSongs = useSelector(selectCustomSongs)
  const searchText = useSelector(selectSearchText)
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
  }, [collectionRes.data, searchText, customSongs])

  const selectedSong = selectedSongGivenSongs(songs)(musicSelection)
  const chartsOfSelectedSong = selectedSong
    ? getPlayableCharts(selectedSong.charts)
    : undefined
  const selectedChart =
    selectedChartGivenCharts(chartsOfSelectedSong)(musicSelection)

  const previewer = useMusicPreviewer()

  function onSelectSong(song: Song, chart?: Chart) {
    if (musicPreviewEnabled) {
      getPreviewResourceUrl(song, serverUrl).then((url) => {
        if (url) {
          previewer.preview(url)
        }
      })
    }
    handleSongSelect(song, chart)
  }

  function onClickChart(chart: Chart, e: MouseEvent) {
    if (!selectedSong) {
      return
    }
    if (selectedChart.md5 === chart.md5) {
      previewer.go()
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
      if (musicPreviewEnabled) {
        getPreviewResourceUrl(selectedSong, serverUrl).then((url) => {
          if (url) {
            previewer.preview(url)
          }
        })
      }
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
        selectedSong={selectedSong!}
        selectedChart={selectedChart}
        playMode={musicSelect.playMode}
        onSelect={onSelectSong}
        onDeselect={handleSongDeselect}
      />
      <MusicInfo
        song={selectedSong!}
        chart={selectedChart}
        charts={chartsOfSelectedSong!}
        playMode={musicSelect.playMode}
        onChartClick={onClickChart}
        onOptions={handleOptionsOpen}
        serverUrl={serverUrl}
      />
    </div>
  )
}

const ToolbarItems = ({
  handleCustomBMSOpen,
  handleAuthenticate,
  handleOptionsOpen,
  handleExit,
}: {
  handleCustomBMSOpen: () => void
  handleAuthenticate: () => void
  handleOptionsOpen: () => void
  handleExit: () => void
}) => {
  const user = useCurrentUser()
  const logOutMutation = useLogOutMutation()

  const handleLogout = () => {
    if (confirm('Do you really want to log out?')) {
      logOutMutation.mutate([])
    }
  }

  const onlineToolbarButton = user ? (
    <ToolbarItem text={`Log Out (${user.username})`} onClick={handleLogout} />
  ) : (
    <ToolbarItem
      text='Log In / Create an Account'
      onClick={handleAuthenticate}
    />
  )

  return (
    <>
      <ToolbarItem text='Exit' onClick={handleExit} />
      <ToolbarItem text='Play Custom BMS' onClick={handleCustomBMSOpen} />
      <ToolbarSeparator />
      {onlineToolbarButton}
      <ToolbarItem text='Options' onClick={handleOptionsOpen} />
    </>
  )
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

      <Toolbar>
        <ToolbarItems
          handleAuthenticate={showAuthenticationPopup}
          handleCustomBMSOpen={showCustomBMSModal}
          handleOptionsOpen={showOptions}
          handleExit={popScene}
        />
      </Toolbar>

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
