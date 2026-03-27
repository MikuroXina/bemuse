import { usePersonalRecordsByMd5Query } from '@bemuse/online/hooks.js'
import type { ScoreboardDataRecord } from '@bemuse/online/index.js'
import { useSelector } from 'react-redux'

import * as ReduxState from '../../redux/redux-state.js'

export interface PartialChart {
  md5: string
}

export const usePersonalRecord = (
  chart: PartialChart
): [isLoading: boolean, record: ScoreboardDataRecord | null] => {
  const playMode = useSelector(ReduxState.selectPlayMode)
  const query = usePersonalRecordsByMd5Query(chart, playMode)
  return [query.isLoading, query.data ?? null]
}
