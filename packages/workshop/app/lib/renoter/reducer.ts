import type { BMSChart } from '@mikuroxina/bms'
import type { RenoteData } from './types'

export type State =
  | {
      type: 'ERROR'
      message: string
    }
  | {
      type: 'OPEN_DIR'
      directoryHandle: FileSystemDirectoryHandle
      bmsFileNames: string[]
    }
  | {
      type: 'OPEN_CHART'
      directoryHandle: FileSystemDirectoryHandle
      renoteChartHandle: FileSystemFileHandle
      renoteData: RenoteData
      chartHandle: FileSystemFileHandle
      chart: BMSChart
      chartData: ArrayBuffer
    }
  | { type: 'LOADING' }
  | { type: 'CLOSED' }

export const initialState: State = { type: 'CLOSED' }

const reducers = {
  ERROR: (_: State, message: string) => ({ type: 'ERROR', message }),
  START_LOAD: (_state: State, _: never[]) => ({ type: 'LOADING' }),
  OPEN_DIR: (
    _: State,
    props: {
      directoryHandle: FileSystemDirectoryHandle
      bmsFileNames: string[]
    }
  ) => ({ type: 'OPEN_DIR', ...props }),
  CLOSE_DIR: (_state: State, _: never[]) => ({ type: 'CLOSED' }),
  OPEN_CHART: (
    state: State,
    props: {
      renoteChartHandle: FileSystemFileHandle
      renoteData: RenoteData
      chartHandle: FileSystemFileHandle
      chart: BMSChart
      chartData: ArrayBuffer
    }
  ) =>
    state.type === 'OPEN_DIR'
      ? { ...state, ...props, type: 'OPEN_CHART' }
      : { type: 'ERROR', message: 'directory not open' },
  CLOSE_CHART: (state: State, bmsFileNames: string[]) =>
    state.type === 'OPEN_CHART'
      ? { ...state, bmsFileNames, type: 'OPEN_DIR' }
      : { type: 'ERROR', message: 'bms not open' },
} as const satisfies Record<string, (state: State, action: any) => State>

type Reducers = typeof reducers
type Payload<K extends keyof Reducers> = Reducers[K] extends (
  state: State,
  action: infer A
) => State
  ? A
  : never

export type Action = {
  [K in keyof Reducers]: [K, Payload<K>]
}[keyof Reducers]

export type Dispatcher = (action: Action) => void

export const reducer = (state: State, [kind, payload]: Action): State =>
  reducers[kind](state, payload as Payload<typeof kind>)
