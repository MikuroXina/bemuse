import { BlobReader, configure, ZipReader } from '@zip.js/zip.js'

import type { FileEntry } from './types.js'

configure({
  useWebWorkers: false,
})

export async function unarchive(file: File): Promise<FileEntry[]> {
  const out: FileEntry[] = []
  const zipFileReader = new BlobReader(file)
  const zipReader = new ZipReader(zipFileReader)
  for await (const entry of zipReader.getEntriesGenerator()) {
    if (!entry.directory) {
      const { filename } = entry
      const file = new File([await entry.arrayBuffer()], filename)
      const parts = filename.split('/')
      for (let i = 0; i < parts.length; ++i) {
        const name = parts.slice(i).join('/')
        out.push({ name, file })
      }
    }
  }
  return out
}
