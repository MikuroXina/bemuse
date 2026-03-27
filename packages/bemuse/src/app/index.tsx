import '@fortawesome/fontawesome-svg-core/styles.css'

import {
  isQueryFlagEnabled,
  shouldShowAbout,
  shouldShowModeSelect,
} from '@bemuse/flags/index.js'
import { type InternetRankingService, useOnline } from '@bemuse/online/index.js'
import { OnlineContext } from '@bemuse/online/instance.js'
import OfflineService from '@bemuse/online/offline-service.js'
import FakeOnlineService from '@bemuse/online/scoreboard-system/fake-online-service.js'
import { MXOnlineService } from '@bemuse/online/scoreboard-system/mx-online-service.js'
import {
  SceneManager,
  SceneManagerContext,
} from '@bemuse/scene-manager/index.js'
import now from '@bemuse/utils/now.js'
import { monetize } from '@mikuroxina/monetizer'
import { Provider } from 'react-redux'

import * as BemuseTestMode from '../debug/bemuse-test-mode.js'
import configureStore from '../redux/configure-store.js'
import { isBrowserSupported } from './browser-support.js'
import AboutScene from './components/about-scene.js'
import BrowserSupportWarningScene from './components/browser-support-warning-scene.js'
import ModeSelectScene from './components/mode-select-scene.js'
import MusicSelectScene from './components/music-select-scene.js'
import TitleScene from './components/title-scene.js'
import { musicSearchTextSlice } from './entities/music-search-text.js'
import { optionsSlice } from './entities/options.js'
import { getInitialGrepString, getTimeSynchroServer } from './query-flags.js'

let ranking: InternetRankingService

if (isQueryFlagEnabled('fake-scoreboard')) {
  ranking = new FakeOnlineService()
} else if (isQueryFlagEnabled('offline')) {
  ranking = new OfflineService()
} else if (import.meta.env.VITE_SCOREBOARD_SERVER) {
  ranking = new MXOnlineService(import.meta.env.VITE_SCOREBOARD_SERVER)
} else {
  console.warn(
    'Warning: No server specified. Using a fake scoreboard that resets when you refresh the page.'
  )
  ranking = new FakeOnlineService()
}

let store = configureStore()

const sceneManager = new SceneManager(({ children }) => {
  const online = useOnline(ranking)
  return (
    <div className='bemuse-scene'>
      <Provider store={store}>
        <SceneManagerContext.Provider value={sceneManager}>
          <OnlineContext.Provider value={online}>
            {children}
          </OnlineContext.Provider>
        </SceneManagerContext.Provider>
      </Provider>
    </div>
  )
})

// Allow hot reloading of some modules.
if (import.meta.hot) {
  import.meta.hot.accept('../redux/configure-store.js', () => {
    store = configureStore()
  })
}

function bootUp() {
  store.dispatch(
    musicSearchTextSlice.actions.MUSIC_SEARCH_TEXT_INITIALIZED({
      text: getInitialGrepString() ?? '',
    })
  )
  store.dispatch(optionsSlice.actions.LOAD_FROM_STORAGE())
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

;(window as unknown as Record<string, unknown>).BemuseTestMode = BemuseTestMode
