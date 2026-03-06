import { parse } from 'valibot'
import type { Action } from './reducer'
import { serverFileSchema } from './server-file'

export async function extract(
  serverFile: FileSystemFileHandle,
  dispatch: (action: Action) => void
): Promise<void> {
  try {
    const file = await serverFile.getFile()
    const text = await file.text()
    const parsed = JSON.parse(text)
    const output = parse(serverFileSchema, parsed)
    dispatch(['LOAD', { handle: serverFile, data: output }])
  } catch (error) {
    alert('Cannot load server file: ' + error)
    console.error(error)
    dispatch(['CLOSE', []])
  }
}
