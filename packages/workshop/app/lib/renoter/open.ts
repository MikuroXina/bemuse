import { Compiler, Reader } from '@mikuroxina/bms'
import type { Action } from './reducer'
import { renoteDataSchema, type RenoteData } from './types'
import { parse } from 'valibot'

export async function openDir(
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
    const bmsFileNames: string[] = await searchBmsFiles(dir)
    dispatch(['OPEN_DIR', { directoryHandle: dir, bmsFileNames }])
  } catch (error) {
    dispatch(['ERROR', (error as Error).message])
  }
}

export async function searchBmsFiles(
  dir: FileSystemDirectoryHandle
): Promise<string[]> {
  const bmsFileNames: string[] = []
  for await (const item of dir.values()) {
    if (item.kind === 'file' && /\.(bms|bme|bml|bmson)$/i.test(item.name)) {
      bmsFileNames.push(item.name)
    }
  }
  return bmsFileNames
}

export async function openChart(
  dirHandle: FileSystemDirectoryHandle,
  chartFileName: string,
  dispatch: (action: Action) => void
): Promise<void> {
  try {
    const bemuseDataHandle = await dirHandle.getDirectoryHandle('bemuse-data', {
      create: true,
    })
    const renoteChartHandle = await bemuseDataHandle.getFileHandle(
      `${chartFileName}.renote.json`,
      { create: true }
    )
    const renoteDataFile = await renoteChartHandle.getFile()
    let renoteData: RenoteData
    if (renoteDataFile.size === 0) {
      renoteData = {
        version: '1.0.0',
        source: chartFileName,
      }
    } else {
      const parsed = JSON.parse(await renoteDataFile.text())
      renoteData = parse(renoteDataSchema, parsed)
    }

    const chartHandle = await dirHandle.getFileHandle(chartFileName)
    const chartFile = await chartHandle.getFile()
    const chartData = await chartFile.arrayBuffer()
    const chartText = await Reader.readAsync(chartData)
    const { chart } = Compiler.compile(chartText)
    dispatch([
      'OPEN_CHART',
      {
        renoteChartHandle,
        renoteData,
        chartHandle,
        chart,
        chartData,
      },
    ])
  } catch (error) {
    dispatch(['ERROR', (error as Error).message])
  }
}
