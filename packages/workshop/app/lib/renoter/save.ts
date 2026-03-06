import { renoteBms } from './core'
import type { RenoteData } from './types'

export async function save({
  renoteSource,
  renoteHandle,
  data,
  directoryHandle,
  chartData,
  detail,
}: {
  renoteSource: string
  renoteHandle: FileSystemFileHandle
  data: RenoteData
  directoryHandle: FileSystemDirectoryHandle
  chartData: ArrayBuffer
  detail: Pick<RenoteData, 'newNotes' | 'groups'>
}): Promise<void> {
  const handle = renoteHandle
  const newData: RenoteData = {
    ...data,
    newNotes: detail.newNotes,
    groups: detail.groups,
  }
  {
    const writable = await handle.createWritable()
    await writable.write(JSON.stringify(newData, null, 2))
    await writable.close()
  }
  const bmsHandle = await directoryHandle.getFileHandle(
    renoteSource + '_renote' + (newData.suffix || '.bms'),
    { create: true }
  )
  {
    const writable = await bmsHandle.createWritable()
    const buffer = await renoteBms(new Uint8Array(chartData), newData)
    await writable.write(buffer)
    await writable.close()
  }
}
