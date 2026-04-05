import fs from 'node:fs'
import path from 'node:path'

import { glob } from 'glob'

const { readFile } = fs.promises

export class Directory {
  constructor(public readonly path: string) {}

  async files(pattern: string) {
    const names = await glob(pattern, { cwd: this.path })
    return await Promise.all(
      names.map(async (name) => {
        const buffer = await readFile(path.join(this.path, name))
        return new FileEntry(this, name, buffer.buffer)
      })
    )
  }
}

export class FileEntry {
  constructor(
    private readonly directory: Directory,
    private readonly filename: string,
    public readonly buffer: ArrayBuffer
  ) {}

  derive(name: string, buffer: ArrayBuffer): FileEntry {
    return new FileEntry(this.directory, name, buffer)
  }

  get name() {
    return this.filename
  }

  get size() {
    return this.buffer.byteLength
  }

  get path() {
    return path.join(this.directory.path, this.filename)
  }
}

export default Directory
