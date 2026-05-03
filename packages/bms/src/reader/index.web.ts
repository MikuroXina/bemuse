import * as chardet from 'chardet'

import type { ReaderOptions } from './types.js'

export function read() {
  throw new Error('Synchronous read unsupported in browser!')
}

export function readAsync(
  buffer: ArrayBuffer,
  options: ReaderOptions | null
): Promise<string> {
  const charset = (options && options.forceEncoding) || chardet.detect(new Uint8Array(buffer))
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function () {
      resolve(reader.result as string)
    }
    reader.onerror = function () {
      reject(new Error('cannot read it'))
    }
    reader.readAsText(new Blob([buffer]), charset ?? 'utf-8')
  })
}

export { getReaderOptionsFromFilename } from './getReaderOptionsFromFilename.js'
