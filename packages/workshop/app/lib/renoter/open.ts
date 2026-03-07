import { Compiler, Reader } from '@mikuroxina/bms'
import type { Action } from './reducer'
import type { RenoteData } from './types'

export async function open(
  renoteSource: string,
  dispatch: (action: Action) => void
): Promise<void> {
  dispatch(['START_LOAD', []])
  let dir
  try {
    dir = await window.showDirectoryPicker({ mode: 'readwrite' })
  } catch (e) {
    dispatch(['ERROR', 'No directory selected.'])
    return
  }
  try {
    const renoteHandle = await dir.getFileHandle(renoteSource + '.renote.json')
    const renoteFile = await renoteHandle.getFile()
    const renoteData: RenoteData = JSON.parse(await renoteFile.text())
    const chartHandle = await dir.getFileHandle(renoteData.source)
    const chartFile = await chartHandle.getFile()
    const chartData = await chartFile.arrayBuffer()
    const chartText = await Reader.readAsync(chartData)
    const { chart } = Compiler.compile(chartText)
    console.log(chart)
    dispatch([
      'OPEN',
      {
        directoryHandle: dir,
        renoteHandle,
        fileHandle: chartHandle,
        data: renoteData,
        chart,
        chartData,
      },
    ])
  } catch (error) {
    dispatch(['ERROR', (error as Error).message])
  }
}
