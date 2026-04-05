import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { cpus } from 'node:os'
import { basename, extname } from 'node:path'

import throat from 'throat'

import type { FileEntry } from './directory.js'

const limit = cpus().length || 1

export class AudioConvertor {
  private _target: string
  private _extra: readonly string[]

  public force = false

  constructor(type: string, ...extra: readonly string[]) {
    this._target = type
    this._extra = extra
  }

  async convert(file: FileEntry) {
    const ext = extname(file.name).toLowerCase()
    if (ext === '.' + this._target && !this.force) {
      return file
    } else {
      const name = basename(file.name, ext) + '.' + this._target
      const buffer = await this._doConvert(file.path, this._target)
      return file.derive(name, buffer)
    }
  }

  private async _doConvert(path: string, type: string) {
    let typeArgs: string[] = []
    try {
      const fd = await fs.promises.open(path, 'r')
      const buffer = new Uint8Array(new ArrayBuffer(4))
      const { bytesRead: read } = await fd.read(
        buffer as Uint8Array<ArrayBufferLike>,
        0,
        4
      )
      await fd.close()
      if (read === 0) {
        console.error('[WARN] Empty keysound file.')
      } else if (
        buffer[0] === 0x49 &&
        buffer[1] === 0x44 &&
        buffer[2] === 0x33
      ) {
        typeArgs = ['-t', 'mp3']
      } else if (buffer[0] === 0xff && buffer[1] === 0xfb) {
        typeArgs = ['-t', 'mp3']
      } else if (
        buffer[0] === 0x4f &&
        buffer[1] === 0x67 &&
        buffer[2] === 0x67 &&
        buffer[3] === 0x53
      ) {
        typeArgs = ['-t', 'ogg']
      }
    } catch {
      console.error('[WARN] Unable to detect file type!')
    }
    return this._doSoX(path, type, typeArgs)
  }

  private _doSoX(path: string, type: string, inputTypeArgs: readonly string[]) {
    return throat(limit, async () => {
      const sox = spawn('sox', [
        ...inputTypeArgs,
        path,
        '-t',
        type,
        ...this._extra,
        '-',
      ])
      sox.stdin.end()
      sox.stderr.on('data', (x) => process.stderr.write(x))
      sox.on('close', (code) => {
        if (code !== 0) {
          console.error('Unable to convert audio file -- SoX exited ' + code)
          throw new Error('SoX process exited: ' + code)
        }
      })
      const buf = Buffer.concat(await Array.fromAsync(sox.stdout))
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
    })
  }
}

export default AudioConvertor
