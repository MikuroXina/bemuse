import type { IndexingInputFile } from '@mikuroxina/bemuse-indexer/lib/types'
import type { Action } from './reducer'
import { getSongInfo } from '@mikuroxina/bemuse-indexer/lib'
import { updateSongFile } from '../song-file'
import { extract } from './extract'

export async function indexCharts(
  usingDir: FileSystemDirectoryHandle,
  dispatch: (action: Action) => void
): Promise<void> {
  dispatch(['START_INDEX_CHARTS', ''])
  try {
    await indexChartFilesFromDirectory(usingDir, {
      setStatus: (status: string) => {
        dispatch(['START_INDEX_CHARTS', status])
      },
    })
    await extract(usingDir, dispatch)
  } finally {
    dispatch(['DONE_INDEX_CHARTS', []])
  }
}

type IndexIO = {
  setStatus: (status: string) => void
}

async function indexChartFilesFromDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  io: IndexIO
) {
  const inputs: IndexingInputFile[] = []
  for await (let [name, handle] of directoryHandle) {
    try {
      if (handle.kind === 'file' && /\.(bms|bme|bml|bmson)$/i.test(name)) {
        io.setStatus(`Reading ${name}...`)
        const fileHandle = handle
        const file = await (fileHandle as FileSystemFileHandle).getFile()
        const fileContents = await file.arrayBuffer()
        inputs.push({
          name,
          data: fileContents,
        })
      }
    } catch (error) {
      console.error(error)
    }
  }
  console.dir({ inputs })
  io.setStatus('Indexing charts...')
  const result = await getSongInfo(inputs, {
    onProgress: (processed, total, name) => {
      io.setStatus(`Indexed (${processed}/${total}) ${name}...`)
    },
  })
  await updateSongFile(directoryHandle, (song) => {
    return {
      ...song,
      bemusepack_url: 'bemuse-data/sound/metadata.json',
      charts: result.charts,
      title: song.title || result.title,
      artist: song.artist || result.artist,
      genre: song.genre || result.genre,
      bpm: song.bpm || result.bpm,
    }
  })
}
