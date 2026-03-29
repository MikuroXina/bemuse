import {
  type ScoreboardDataRecord,
  useRecordQuery,
} from '@bemuse/online/index.js'
import type { UseQueryResult } from '@tanstack/react-query'
import { useSelector } from 'react-redux'

import * as ReduxState from '../../redux/redux-state.js'

export interface PartialChart {
  md5: string
}

export const usePersonalRecord = (
  chart: PartialChart
): UseQueryResult<ScoreboardDataRecord | null> => {
  const playMode = useSelector(ReduxState.selectPlayMode)
  return useRecordQuery(chart, playMode)
}
