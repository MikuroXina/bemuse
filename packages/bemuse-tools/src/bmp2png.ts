import { spawn } from 'node:child_process'
import { promises } from 'node:fs'
import { cpus } from 'node:os'
import { basename, extname } from 'node:path'

import throat from 'throat'

import { FileEntry } from './directory.js'

const limit = cpus().length || 1

export function bmp2png(file: FileEntry): Promise<FileEntry> {
  return throat(limit, async () => {
    const realPath = await promises.realpath(file.path)
    const convert = spawn('magick', [realPath, 'png:-'])
    convert.stdin.end()
    convert.stderr.on('data', (x) => process.stderr.write(x))
    convert.on('close', (code) => {
      if (code !== 0) {
        console.error('Unable to convert BMP file to PNG: ' + code)
        throw new Error('convert exited: ' + code)
      }
    })
    const data = Buffer.concat(await Array.fromAsync(convert.stdout))
    return file.derive(
      basename(file.name, extname(file.name)) + '.png',
      data.buffer
    )
  })
}

export default bmp2png
