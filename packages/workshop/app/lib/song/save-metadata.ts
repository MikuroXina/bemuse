import type { SongMetadata } from '@mikuroxina/bemuse-types'
import { updateSongFile } from '../song-file'

export async function saveMetadata(
  usingDir: FileSystemDirectoryHandle,
  update: (song: SongMetadata) => SongMetadata,
  readmeContents: string
) {
  await updateSongFile(usingDir, update)
  const readmeHandle = await usingDir.getFileHandle('README.md', {
    create: true,
  })
  const writable = await readmeHandle.createWritable()
  await writable.write(readmeContents)
  await writable.close()
}
