import type { BMSObject, Keysounds } from '@mikuroxina/bms'
import chroma from 'chroma-js'
import memoize from 'lodash/memoize'
import { minimatch } from 'minimatch'

import {
  type Channel,
  channels,
  type ObjectRow,
  type RenoteData,
  type TimeKey,
} from '../../lib/renoter/types'

export const PX_PER_BEAT = 64

export interface RenoterLayout {
  groupColumns: {
    x: number
    width: number
  }[]
  getGroupColor(groupIndex: number): string
  getNextGroupIndex(currentGroupIndex: number): number
  getPreviousGroupIndex(currentGroupIndex: number): number
  getRowByTimeKey(timeKey: TimeKey): ObjectRow
  getRowAbove(
    currentTimeKey: TimeKey,
    currentGroupIndex: number
  ): ObjectRow | undefined
  getRowBelow(
    currentTimeKey: TimeKey,
    currentGroupIndex: number
  ): ObjectRow | undefined
  getGroupIndex(object: BMSObject): number
  getX(row: ObjectRow, object: BMSObject): number
  getNoteX(channel: Channel): number
}

export function calculateLayout(
  objectRows: ObjectRow[],
  groups: NonNullable<RenoteData['groups']>,
  keysounds: Keysounds
): RenoterLayout {
  const initializeGroupViewModel = () => ({ size: 1, x: 0 })
  const timeKeyToIndex = new Map<TimeKey, number>()
  const groupViewModels = [
    ...groups.map(() => initializeGroupViewModel()),
    initializeGroupViewModel(),
  ]
  const getGroupIndexFromKeysound = memoize((keysound: string) => {
    for (const [i, group] of groups.entries()) {
      if (
        keysound &&
        group.patterns.some((pattern) => minimatch(keysound, pattern))
      ) {
        return i
      }
    }
    return groups.length
  })
  const getGroupIndexFromValue = (value: string) => {
    return getGroupIndexFromKeysound(keysounds.get(value)!)
  }

  // Calculate group size
  for (const [i, row] of objectRows.entries()) {
    timeKeyToIndex.set(row.timeKey, i)
    const getUsedSizeByGroupIndex = memoize((_groupIndex: number) => ({
      size: 0,
    }))
    for (const object of row.objects) {
      const groupIndex = getGroupIndexFromValue(object.value)
      const size = ++getUsedSizeByGroupIndex(groupIndex).size
      if (size > groupViewModels[groupIndex].size) {
        groupViewModels[groupIndex].size = size
      }
    }
  }

  // Calculate group position
  {
    let x = 0
    for (const groupViewModel of groupViewModels) {
      groupViewModel.x = x
      x += groupViewModel.size + 0.5
    }
  }

  const getRowLayout = memoize(
    (row: ObjectRow) => {
      const xMap = new Map<BMSObject, number>()
      const xAllocator = memoize((_groupIndex: number) => ({ nextX: 0 }))
      for (const object of row.objects.values()) {
        const groupIndex = getGroupIndexFromValue(object.value)
        const x = groupViewModels[groupIndex].x + xAllocator(groupIndex).nextX++
        xMap.set(object, 96 + (10 + x) * 32)
      }
      return {
        getX: (object: BMSObject) => xMap.get(object) || 0,
      }
    },
    (row: ObjectRow) => row.timeKey
  )
  const searchRow = (
    currentTimeKey: TimeKey,
    currentGroupIndex: number,
    direction: number
  ) => {
    let index = timeKeyToIndex.get(currentTimeKey)
    if (index === undefined) {
      return undefined
    }
    index += direction
    for (; 0 <= index && index < objectRows.length; index += direction) {
      const row = objectRows[index]
      if (
        row.objects.some(
          (object) => getGroupIndexFromValue(object.value) === currentGroupIndex
        )
      ) {
        return row
      }
    }
    return undefined
  }
  return {
    groupColumns: groupViewModels.map((c) => ({
      x: 96 + (10 + c.x) * 32,
      width: c.size * 32,
    })),
    getNextGroupIndex: (i) => (i + 1) % groupViewModels.length,
    getPreviousGroupIndex: (i) =>
      (i + groupViewModels.length - 1) % groupViewModels.length,
    getX: (row, object) => getRowLayout(row).getX(object),
    getNoteX: (channel) => 96 + 32 * channels.indexOf(channel),
    getGroupIndex: (object) => getGroupIndexFromValue(object.value),
    getGroupColor: (groupIndex) =>
      chroma
        .lch(85, 100, ((groupIndex + 1) * 360) / groupViewModels.length)
        .hex(),
    getRowByTimeKey: (timeKey) => objectRows[timeKeyToIndex.get(timeKey)!],
    getRowAbove: (currentTimeKey: TimeKey, currentGroupIndex: number) => {
      return searchRow(currentTimeKey, currentGroupIndex, -1)
    },
    getRowBelow: (currentTimeKey: TimeKey, currentGroupIndex: number) => {
      return searchRow(currentTimeKey, currentGroupIndex, 1)
    },
  }
}
