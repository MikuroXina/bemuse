// Public: A module that takes a buffer, detects the character set, and
// returns the decoded string.
//
// The Reader follows [ruv-it!’s algorithm](http://hitkey.nekokan.dyndns.info/cmds.htm#CHARSET)
// for detecting the character set.
//
import * as chardet from 'chardet'
import * as iconv from 'iconv-lite'

import { ReaderOptions } from './types.js'

/**
 * Reads the buffer, detect the character set, and returns the decoded
 * string synchronously.
 * @returns the decoded text
 */
export function read(
  buffer: Buffer,
  options: ReaderOptions | null = null
): string {
  const charset = (options && options.forceEncoding) || chardet.detect(buffer)
  const text = iconv.decode(buffer, charset ?? 'utf-8')
  if (text.charCodeAt(0) === 0xfeff) {
    // BOM?!
    return text.slice(1)
  } else {
    return text
  }
}

/**
 * Like `read(buffer)`, but this is the asynchronous version.
 */
export function readAsync(
  buffer: Buffer,
  options: ReaderOptions | null
): Promise<string>
/**
 * Like `read(buffer)`, but this is the asynchronous version.
 */
export function readAsync(buffer: Buffer): Promise<string>
export function readAsync(
  buffer: Buffer,
  options?: ReaderOptions | null
): Promise<string> {
  return new Promise(function (resolve, reject) {
    try {
      resolve(read(buffer, options))
    } catch (e) {
      reject(e)
    }
  })
}

export { getReaderOptionsFromFilename } from './getReaderOptionsFromFilename.js'
