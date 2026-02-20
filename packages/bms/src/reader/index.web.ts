import { detect } from 'bemuse-chardet'

import type { ReaderOptions } from './types.js'

export function read() {
  throw new Error('Synchronous read unsupported in browser!')
}

export function readAsync(
  buffer: Buffer,
  options: ReaderOptions | null
): Promise<string> {
  const charset = (options && options.forceEncoding) || detect(buffer)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function () {
      resolve(reader.result as string)
    }
    reader.onerror = function () {
      reject(new Error('cannot read it'))
    }
    reader.readAsText(new Blob([buffer as BlobPart]), charset)
  })
}

export { getReaderOptionsFromFilename } from './getReaderOptionsFromFilename.js'
