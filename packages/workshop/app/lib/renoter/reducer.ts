import type { BMSChart } from '@mikuroxina/bms'
import type { RenoteData } from './types'

export type State =
  | {
      type: 'ERROR'
      message: string
    }
  | {
      type: 'OPEN'
      data: RenoteData
      directoryHandle: FileSystemDirectoryHandle
      renoteHandle: FileSystemFileHandle
      fileHandle: FileSystemFileHandle
      chart: BMSChart
      chartData: ArrayBuffer
    }
  | { type: 'LOADING' }
  | { type: 'CLOSED' }

export const initialState: State = { type: 'CLOSED' }

const reducers = {
  ERROR: (_: State, message: string) => ({ type: 'ERROR', message }),
  START_LOAD: (_state: State, _: never[]) => ({ type: 'LOADING' }),
  OPEN: (
    _: State,
    props: {
      data: RenoteData
      directoryHandle: FileSystemDirectoryHandle
      renoteHandle: FileSystemFileHandle
      fileHandle: FileSystemFileHandle
      chart: BMSChart
      chartData: ArrayBuffer
    }
  ) => ({ type: 'OPEN', ...props }),
  CLOSE: (_state: State, _: never[]) => ({ type: 'CLOSED' }),
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
