import type { BMSObject, Keysounds } from "@mikuroxina/bms";
import type { ObjectRow, RenoteData } from "./RenoterTypes";
import { memoize } from "lodash";
import minimatch from "minimatch";
import chroma from "chroma-js";

export const PX_PER_BEAT = 64;
const channels = ["SC", "K1", "K2", "K3", "K4", "K5", "K6", "K7"];

export interface RenoterLayout {
  groupColumns: {
    x: number;
    width: number;
  }[];
  getGroupColor(groupIndex: number): string;
  getNextGroupIndex(currentGroupIndex: number): number;
  getPreviousGroupIndex(currentGroupIndex: number): number;
  getRowByTimeKey(timeKey: string): ObjectRow;
  getRowAbove(currentTimeKey: string, currentGroupIndex: number): ObjectRow;
  getRowBelow(currentTimeKey: string, currentGroupIndex: number): ObjectRow;
  getGroupIndex(object: BMSObject): number;
  getX(row: ObjectRow, object: BMSObject): number;
  getNoteX(channel: string): number;
}

export function calculateLayout(
  objectRows: ObjectRow[],
  groups: RenoteData["groups"],
  keysounds: Keysounds,
): RenoterLayout {
  const initializeGroupViewModel = () => ({ size: 1, x: 0 });
  const timeKeyToIndex = new Map<string, number>();
  const groupViewModels = [
    ...groups.map(() => initializeGroupViewModel()),
    initializeGroupViewModel(),
  ];
  const getGroupIndexFromKeysound = memoize((keysound: string) => {
    for (const [i, group] of groups.entries()) {
      if (
        keysound &&
        group.patterns.some((pattern) => minimatch(keysound, pattern))
      ) {
        return i;
      }
    }
    return groups.length;
  });
  const getGroupIndexFromValue = (value: string) => {
    return getGroupIndexFromKeysound(keysounds.get(value));
  };

  // Calculate group size
  for (const [i, row] of objectRows.entries()) {
    timeKeyToIndex.set(row.timeKey, i);
    const getUsedSizeByGroupIndex = memoize((groupIndex: number) => ({
      size: 0,
    }));
    for (const object of row.objects) {
      const groupIndex = getGroupIndexFromValue(object.value);
      const size = ++getUsedSizeByGroupIndex(groupIndex).size;
      if (size > groupViewModels[groupIndex].size) {
        groupViewModels[groupIndex].size = size;
      }
    }
  }

  // Calculate group position
  {
    let x = 0;
    for (const groupViewModel of groupViewModels) {
      groupViewModel.x = x;
      x += groupViewModel.size + 0.5;
    }
  }

  const getRowLayout = memoize(
    (row: ObjectRow) => {
      const xMap = new Map<BMSObject, number>();
      const xAllocator = memoize((groupIndex: number) => ({ nextX: 0 }));
      for (const [i, object] of row.objects.entries()) {
        const groupIndex = getGroupIndexFromValue(object.value);
        const x =
          groupViewModels[groupIndex].x + xAllocator(groupIndex).nextX++;
        xMap.set(object, 96 + (10 + x) * 32);
      }
      return {
        getX: (object: BMSObject) => xMap.get(object) || 0,
      };
    },
    (row: ObjectRow) => row.timeKey,
  );
  const searchRow = (
    currentTimeKey: string,
    currentGroupIndex: number,
    direction: number,
  ) => {
    let index = timeKeyToIndex.get(currentTimeKey);
    if (index === undefined) {
      return undefined;
    }
    index += direction;
    for (; 0 <= index && index < objectRows.length; index += direction) {
      const row = objectRows[index];
      if (
        row.objects.some(
          (object) =>
            getGroupIndexFromValue(object.value) === currentGroupIndex,
        )
      ) {
        return row;
      }
    }
    return undefined;
  };
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

    getRowByTimeKey: (timeKey) => objectRows[timeKeyToIndex.get(timeKey)],
    getRowAbove: (currentTimeKey: string, currentGroupIndex: number) => {
      return searchRow(currentTimeKey, currentGroupIndex, -1);
    },
    getRowBelow: (currentTimeKey: string, currentGroupIndex: number) => {
      return searchRow(currentTimeKey, currentGroupIndex, 1);
    },
  };
}
