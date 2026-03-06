import type { ServerFile } from './server-file'

export async function save(serverFile: FileSystemFileHandle, data: ServerFile) {
  const writable = await serverFile.createWritable()
  await writable.write(JSON.stringify(data, null, 2))
  await writable.close()
  console.log('Saved...')
}
