import { renoteBms } from './core'
import type { RenoteData } from './types'

export async function save({
  directoryHandle,
  renoteChartHandle,
  renoteData,
  chartFileName,
  chartData,
  detail,
}: {
  directoryHandle: FileSystemDirectoryHandle
  renoteChartHandle: FileSystemFileHandle
  renoteData: RenoteData
  chartFileName: string
  chartData: ArrayBuffer
  detail: Pick<RenoteData, 'newNotes' | 'groups'>
}): Promise<void> {
  const handle = renoteChartHandle
  const newData: RenoteData = {
    ...renoteData,
    newNotes: detail.newNotes,
    groups: detail.groups,
  }
  {
    const writable = await handle.createWritable()
    await writable.write(JSON.stringify(newData, null, 2))
    await writable.close()
  }
  const bmsHandle = await directoryHandle.getFileHandle(
    `${chartFileName}.renote.bms`,
    { create: true }
  )
  {
    const writable = await bmsHandle.createWritable()
    const buffer = await renoteBms(new Uint8Array(chartData), newData)
    await writable.write(buffer)
    await writable.close()
  }
}
