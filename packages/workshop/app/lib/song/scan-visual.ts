import { updateSongFile } from '../song-file'
import { extract } from './extract'
import type { Action } from './reducer'

export async function scanVisual(
  usingDir: FileSystemDirectoryHandle,
  dispatch: (action: Action) => void
): Promise<void> {
  dispatch(['START_SCAN_VISUAL', ''])
  try {
    const bemuseDataDir = await usingDir.getDirectoryHandle('bemuse-data')
    const scan = async (paths: string[]): Promise<string | undefined> => {
      // Return the first file that exists.
      for (const path of paths) {
        try {
          const handle = await bemuseDataDir.getFileHandle(path)
          if (handle) {
            return path
          }
        } catch (e) {}
      }
    }

    const backImageFile = await scan(['back_image.jpg', 'back_image.png'])
    const eyecatchImageFile = await scan([
      'eyecatch_image.jpg',
      'eyecatch_image.png',
    ])
    const bgaFile = await scan(['bga.webm', 'bga.mp4'])
    console.log({
      backImageFile,
      eyecatchImageFile,
      bgaFile,
    })
    await updateSongFile(usingDir, (song) => {
      const toUrl = (file: string | undefined) =>
        file ? `bemuse-data/${file}` : undefined
      return {
        ...song,
        back_image_url: toUrl(backImageFile),
        eyecatch_image_url: toUrl(eyecatchImageFile),
        video_url: toUrl(bgaFile),
      }
    })
    await extract(usingDir, dispatch)
  } finally {
    dispatch(['DONE_SCAN_VISUAL', []])
  }
}
