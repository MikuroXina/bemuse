import { updateSongFile } from '../song-file'
import type { LogEvent } from '@ffmpeg/ffmpeg'
import type { Action } from './reducer'
import { extract } from './extract'
import { prepareFFmpeg } from '../song-render'

export async function createPreview(
  usingDir: FileSystemDirectoryHandle,
  startTime: number,
  dispatch: (action: Action) => void
) {
  dispatch(['START_CREATE_PREVIEW', 'Creating preview...'])
  try {
    await createPreviewForDirectory(usingDir, startTime, (text) => {
      dispatch(['START_CREATE_PREVIEW', text])
    })
    await extract(usingDir, dispatch)
  } finally {
    dispatch(['DONE_CREATE_PREVIEW', []])
  }
}

export async function createPreviewForDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  startTime: number,
  log: (text: string) => void
) {
  const renderContext = new OfflineAudioContext(2, 44100 * 30, 44100)
  const songBuffer = await directoryHandle
    .getDirectoryHandle('bemuse-data')
    .then((dir) => dir.getFileHandle('song.ogg'))
    .then((f) => f.getFile())
    .then((f) => f.arrayBuffer())
    .then((ab) => renderContext.decodeAudioData(ab))

  log('Rendering preview...')
  const songSource = renderContext.createBufferSource()
  songSource.buffer = songBuffer
  const gain = renderContext.createGain()
  gain.gain.value = 0
  gain.gain.setValueAtTime(0, 0)
  gain.gain.linearRampToValueAtTime(1, 0.5)
  gain.gain.linearRampToValueAtTime(1, 27)
  gain.gain.linearRampToValueAtTime(0, 30)
  gain.connect(renderContext.destination)
  songSource.connect(gain)
  songSource.start(0, startTime)

  const result = await renderContext.startRendering()

  log('Encoding MP3...')
  const mp3 = await convertToMp3(result)

  const writable = await directoryHandle
    .getDirectoryHandle('bemuse-data')
    .then((d) => d.getFileHandle('preview.mp3', { create: true }))
    .then((h) => h.createWritable())
  await writable.write(mp3)
  await writable.close()
  log('Song preview created')

  await updateSongFile(directoryHandle, (song) => {
    return {
      ...song,
      preview_offset: startTime,
      preview_url: 'bemuse-data/preview.mp3',
    }
  })
}

async function convertToMp3(buf: AudioBuffer) {
  const ffmpeg = await prepareFFmpeg(buf)
  try {
    const args = [
      ...['-f', 'f32le', '-ar', '44100', '-i', 'ch0.f32'],
      ...['-f', 'f32le', '-ar', '44100', '-i', 'ch1.f32'],
      ...[
        '-f',
        'mp3',
        '-acodec',
        'libmp3lame',
        '-b',
        '128',
        '-filter_complex',
        `[0:a][1:a]join=inputs=2:channel_layout=stereo[a]`,
        '-map',
        '[a]',
        'preview.mp3',
      ],
    ]
    console.debug('=>', args)
    const handleLog = ({ message }: LogEvent) => {
      console.debug('=>', message)
    }
    ffmpeg.on('log', handleLog)
    try {
      await ffmpeg.exec(['-hide_banner', ...args])
    } catch (e) {
      console.error(e)
    } finally {
      ffmpeg.off('log', handleLog)
    }

    const mp3 = await ffmpeg.readFile('preview.mp3')
    return mp3 as Uint8Array<ArrayBuffer>
  } finally {
    ffmpeg.deleteFile('ch0.f32')
    ffmpeg.deleteFile('ch1.f32')
    ffmpeg.deleteFile('preview.mp3')
  }
}
