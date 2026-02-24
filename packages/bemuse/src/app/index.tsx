import {
  getDefaultCustomFolderContext,
  getSongsFromCustomFolders,
} from '@bemuse/custom-folder/index.js'
import {
  isQueryFlagEnabled,
  shouldShowAbout,
  shouldShowModeSelect,
} from '@bemuse/flags/index.js'
import { OFFICIAL_SERVER_URL } from '@bemuse/music-collection/index.js'
import {
  SceneManager,
  SceneManagerContext,
} from '@bemuse/scene-manager/index.js'
import now from '@bemuse/utils/now.js'
import { monetize } from '@mikuroxina/monetizer'
import { Provider } from 'react-redux'

import * as BemuseTestMode from '../debug/BemuseTestMode.js'
import configureStore from '../redux/configureStore.js'
import * as ReduxState from '../redux/ReduxState.js'
import { isBrowserSupported } from './browser-support.js'
import { musicSearchTextSlice } from './entities/MusicSearchText.js'
import { optionsSlice } from './entities/Options.js'
import {
  getInitialGrepString,
  getMusicServer,
  getTimeSynchroServer,
} from './query-flags.js'
import AboutScene from './ui/AboutScene.js'
import BrowserSupportWarningScene from './ui/BrowserSupportWarningScene.js'
import ModeSelectScene from './ui/ModeSelectScene.js'
import MusicSelectScene from './ui/MusicSelectScene.js'
import TitleScene from './ui/TitleScene.js'

const store = configureStore()

const sceneManager = new SceneManager(({ children }) => (
  <div className='bemuse-scene'>
    <Provider store={store}>
      <SceneManagerContext.Provider value={sceneManager}>
        {children}
      </SceneManagerContext.Provider>
    </Provider>
  </div>
))

// Allow hot reloading of some modules.
if (import.meta.hot) {
  import.meta.hot.accept('../redux/ReduxState.js', () => {})
}

function bootUp() {
  store.dispatch(
    ReduxState.collectionsSlice.actions.COLLECTION_LOADING_BEGAN({
      url: getMusicServer() || OFFICIAL_SERVER_URL,
    })
  )
  store.dispatch(
    musicSearchTextSlice.actions.MUSIC_SEARCH_TEXT_INITIALIZED({
      text: getInitialGrepString() ?? '',
    })
  )
  store.dispatch(optionsSlice.actions.LOAD_FROM_STORAGE())

  getSongsFromCustomFolders(getDefaultCustomFolderContext()).then((songs) => {
    if (songs.length > 0) {
      store.dispatch(
        ReduxState.customSongsSlice.actions.CUSTOM_SONGS_LOADED({
          songs,
        })
      )
    }
  })
}

export function main() {
  bootUp()
  displayFirstScene()

  // synchronize time
  const timeSynchroServer =
    getTimeSynchroServer() || 'wss://timesynchro.herokuapp.com/'
  if (timeSynchroServer) {
    now.synchronize(timeSynchroServer)
  }

  // add web monetization meta tag
  monetize('$twitter.xrptipbot.com/bemusegame')
}

function displayFirstScene() {
  sceneManager.display(getFirstScene())
}

function getFirstScene() {
  if (shouldShowAbout()) {
    return <AboutScene />
  }
  if (shouldShowModeSelect()) {
    return <ModeSelectScene />
  }
  if (isQueryFlagEnabled('skip-to-music-select')) {
    return <MusicSelectScene />
  }

  const scene = <TitleScene />
  if (!isBrowserSupported()) {
    return <BrowserSupportWarningScene next={scene} />
  }
  return scene
}

Object.assign(window, {
  BemuseTestMode,
})
