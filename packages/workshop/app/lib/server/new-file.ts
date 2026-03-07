import { extract } from './extract'
import type { Action } from './reducer'
import type { ServerFile } from './server-file'

export async function newServerFile(dispatch: (action: Action) => void) {
  const file = await window.showSaveFilePicker({
    types: [
      {
        description: 'Server index file (index.json)',
        accept: {
          'application/json': '.json',
        },
      },
    ],
    suggestedName: 'index.json',
  })

  const writable = await file.createWritable()
  await writable.write(
    JSON.stringify({
      urls: [],
      songs: [],
    } satisfies ServerFile)
  )
  await writable.close()

  await extract(file, dispatch)
}
