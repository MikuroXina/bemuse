import { updateSongFile } from '../song-file'
import { extract } from './extract'
import type { Action } from './reducer'

export async function setVideoOffset(
  usingDir: FileSystemDirectoryHandle,
  offset: number,
  dispatch: (action: Action) => void
): Promise<void> {
  await updateSongFile(usingDir, (song) => ({
    ...song,
    video_offset: offset,
  }))
  await extract(usingDir, dispatch)
}
