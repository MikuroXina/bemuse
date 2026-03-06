import type { SoundAssetsMetadata } from '../types'
import type { Action } from './reducer'
import { extract } from './extract'
import { renderSongInDirectory } from '../song-render'

export async function renderSong(
  usingDir: FileSystemDirectoryHandle,
  soundAssets: SoundAssetsMetadata,
  chartFilename: string,
  dispatch: (action: Action) => void
): Promise<void> {
  dispatch(['START_RENDER', ''])
  try {
    await renderSongInDirectory(
      usingDir,
      chartFilename,
      soundAssets,
      (message: string) => {
        console.log(message)
        dispatch(['START_RENDER', message])
      }
    )
    await extract(usingDir, dispatch)
  } finally {
    dispatch(['DONE_RENDER', []])
  }
}
