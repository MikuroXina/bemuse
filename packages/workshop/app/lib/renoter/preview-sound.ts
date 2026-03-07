import pMemoize from 'p-memoize'
import { SoundPlayer } from './sound-player'

export async function previewSound(
  directoryHandle: FileSystemDirectoryHandle,
  soundFileSrc: string
): Promise<void> {
  const buf = await getSample(soundFileSrc, directoryHandle)
  if (buf) {
    SoundPlayer.getInstance().play(Promise.resolve(buf))
  }
}

const getSample = pMemoize(
  async (soundFileSrc: string, directoryHandle: FileSystemDirectoryHandle) => {
    const soundFilesToTry = [
      soundFileSrc,
      soundFileSrc.replace(/\.\w\w\w$/, '.wav'),
      soundFileSrc.replace(/\.\w\w\w$/, '.ogg'),
      soundFileSrc.replace(/\.\w\w\w$/, '.mp3'),
    ]
    for (const file of soundFilesToTry) {
      try {
        const soundFileHandle = await directoryHandle.getFileHandle(file)
        const soundFile = await soundFileHandle.getFile()
        const soundData = await soundFile.arrayBuffer()
        const ctx = SoundPlayer.getInstance().context
        const buffer = await ctx.decodeAudioData(soundData)
        return buffer
      } catch (error) {
        console.log(error)
      }
    }
  }
)
