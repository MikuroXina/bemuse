import { Archive, type FileRecord } from 'libarchive.js/main.js'

import { addUnprefixed } from './addUnprefixed.js'
import type { FileEntry } from './types.js'

Archive.init({
  workerUrl: '/vendor/libarchive.js-1.3.0/dist/worker-bundle.js',
})

export async function unarchive(file: File): Promise<FileEntry[]> {
  const out: FileEntry[] = []
  const archive = await Archive.open(file)
  const extracted = await archive.extractFiles()
  const traverse = (tree: FileRecord, prefix = '') => {
    for (const key of Object.keys(tree)) {
      const value = tree[key]
      if (value instanceof File) {
        addUnprefixed(prefix, key, (name) => {
          out.push({ name, file: value })
        })
      } else if (value && typeof value === 'object') {
        traverse(value, prefix + key + '/')
      }
    }
  }
  traverse(extracted)
  return out
}
