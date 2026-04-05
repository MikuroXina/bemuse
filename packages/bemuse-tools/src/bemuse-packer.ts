import fs from 'node:fs'
import path from 'node:path'

import { FileEntry } from './directory.js'
import Payload from './payload.js'

const { writeFile } = fs.promises

export class BemusePacker {
  private _refs: Ref[] = []

  pack(name: string, files: FileEntry[]): void {
    const max = 1474560
    let cur = null
    files = files.slice()
    files.sort((a, b) => b.size - a.size)
    for (const file of files) {
      if (cur === null || (cur.size > 0 && cur.size + file.size > max)) {
        cur = this.ref(name)
      }
      cur.add(file)
    }
  }

  ref(name: string): Ref {
    const ref = new Ref(name, this._refs.length)
    this._refs.push(ref)
    return ref
  }

  async write(folder: string): Promise<void> {
    const files = []
    const refs = []
    const counts: Record<string, number> = {}
    for (const ref of this._refs) {
      const payload = new Payload()
      for (const file of ref.files) {
        const [start, end] = payload.add(file.buffer)
        files.push({ name: file.name, ref: [ref.index, start, end] })
      }
      const hash = payload.hash
      const num = (counts[ref.name] || 0) + 1
      counts[ref.name] = num
      const out = ref.name + '.' + num + '.' + hash.slice(0, 8) + '.bemuse'
      refs.push({ path: out, hash: hash })
      await this._writeBin(path.join(folder, out), new ArrayBuffer(0), payload)
      console.log(`Written ${out}`)
    }
    const metadata = { files, refs }
    await writeFile(
      path.join(folder, 'metadata.json'),
      JSON.stringify(metadata)
    )
    console.log(`Written metadata.json`)
  }

  private _writeBin(
    path: string,
    metadataBuffer: ArrayBuffer,
    payload: Payload
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const file = fs.createWriteStream(path)
      const size = Buffer.alloc(4)
      size.writeUInt32LE(metadataBuffer.byteLength, 0)
      file.write(Buffer.from('BEMUSEPACK'))
      file.write(size)
      file.write(metadataBuffer)
      for (const buffer of payload.buffers) {
        file.write(buffer)
      }
      file.once('finish', () => resolve())
      file.once('error', reject)
      file.end()
    })
  }
}

export class Ref {
  public size = 0
  public readonly files: FileEntry[] = []

  constructor(
    public readonly name: string,
    public readonly index: number
  ) {}

  add(file: FileEntry): void {
    this.files.push(file)
    this.size += file.size
  }
}

export default BemusePacker
