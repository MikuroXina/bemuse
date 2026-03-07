import { getSongInfo } from '@mikuroxina/bemuse-indexer'

addEventListener('message', function ({ data }) {
  const files: {
    name: string
    data: ArrayBuffer
  }[] = data.files
  postMessage({ type: 'started' })
  function onProgress(current: number, total: number, file: string) {
    postMessage({ type: 'progress', current, total, file })
  }
  getSongInfo(files, { onProgress })
    .then(function (song) {
      if (song.warnings) {
        for (const warning of song.warnings) {
          console.warn(warning)
        }
      }
      postMessage({ type: 'result', song: song })
    })
    .catch(function (e) {
      console.error('CAUGHT', e)
    })
})
