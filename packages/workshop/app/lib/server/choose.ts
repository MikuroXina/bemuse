import { extract } from './extract'
import type { Action } from './reducer'

export async function chooseServerFile(
  dispatch: (action: Action) => void
): Promise<void> {
  const [file] = await window.showOpenFilePicker({
    types: [
      {
        description: 'Server index file (index.json)',
        accept: {
          'application/json': '.json',
        },
      },
    ],
  })

  await extract(file, dispatch)
}
