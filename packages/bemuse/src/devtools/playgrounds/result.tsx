import ResultScene from '@bemuse/components/result/result-scene.js'
import configureStore from '@bemuse/redux/configure-store.js'
import { SceneManager } from '@bemuse/scene-manager'
import { Provider } from 'react-redux'

const sceneManager = new SceneManager((children) => <>{children}</>)

export function main() {
  const props = {
    result: {
      1: 9999,
      2: 999,
      3: 99,
      4: 9,
      missed: 123,
      score: 543210,
      maxCombo: 5555,
      accuracy: 0.97,
      totalCombo: 11106,
      totalNotes: 11106,
      tainted: false,
      grade: 'A',
      deltas: [0, 0.01, 0.03, -0.03, -0.06],
      log: '',
    },
    chart: {
      info: {
        title: 'Test Song',
        subtitles: ['fl*cknother'],
        artist: 'iaht',
        subartists: ['obj.flicknote'],
        genre: 'Frantic Hardcore',
        difficulty: 2,
        level: 17,
      },
      noteCount: 11106,
      bpm: {
        init: 120,
        min: 120,
        median: 120,
        max: 120,
      },
      duration: 10,
      scratch: false,
      keys: '5K' as const,
      file: '',
      md5: '12345670123456789abcdef89abemuse',
    },
    lr2Timegate: [20, 40],
    onExit: () => alert('Exit!'),
    onReplay: () => alert('Replay!'),
    playMode: 'TS' as const,
  }
  sceneManager.display(
    <Provider store={configureStore()}>
      <ResultScene {...props} />
    </Provider>
  )
}
