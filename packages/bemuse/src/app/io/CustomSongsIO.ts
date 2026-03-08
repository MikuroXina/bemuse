import type { ICustomSongResources } from '@bemuse/resources/types.js'
import { URLResources } from '@bemuse/resources/url.js'

import {
  CustomSongResources,
  downloadFileEntryFromURL,
} from '../../resources/custom-song-resources.js'
import DndResources from '../../resources/dnd-resources.js'

export const handleCustomSongFileSelect = (
  selectedFile: File
): ICustomSongResources =>
  new CustomSongResources({
    getFiles: async () => [{ name: selectedFile.name, file: selectedFile }],
  })

export const handleCustomSongFolderDrop = (
  event: DragEvent
): ICustomSongResources => new DndResources(event)

export const handleCustomSongURLLoad = (url: string): ICustomSongResources =>
  new CustomSongResources(
    {
      getFiles: async (log) => [await downloadFileEntryFromURL(url, log)],
    },
    ['Loading from ' + url]
  )

export const handleClipboardPaste = (
  e: ClipboardEvent
): ICustomSongResources | null => {
  const text = e.clipboardData?.getData('text/plain')
  if (!text) {
    return null
  }
  {
    const match = text.match(
      /https?:\/\/[a-zA-Z0-9:.-]+(?:\/\S+)?\/bemuse-song\.json/
    )
    if (match) {
      const url = match[0]
      return new PreparedSongResources(new URL(url), [
        'Loading prepared song...',
      ])
    }
  }
  return null
}

class PreparedSongResources
  extends URLResources
  implements ICustomSongResources
{
  constructor(
    base: URL,
    public readonly initialLog: readonly string[]
  ) {
    super(base)
  }
  fileList = Promise.resolve(['bemuse-song.json'])
}
