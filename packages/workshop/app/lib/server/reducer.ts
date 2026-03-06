import type { ServerFile } from './server-file'

export type Status = 'scanning' | 'error' | 'completed' | 'skipped'

export interface State {
  serverFile: FileSystemFileHandle | null
  data: ServerFile
  scanStatus: Record<string, Status>
}

export const initialState: State = {
  serverFile: null,
  data: { songs: [], urls: [] },
  scanStatus: {},
}

const reducers = {
  LOAD: (
    state: State,
    { handle, data }: { handle: FileSystemFileHandle; data: ServerFile }
  ) => ({ ...state, serverFile: handle, data }),
  CLOSE: (state: State, _: never[]) => ({
    ...state,
    serverFile: null,
    data: { songs: [], urls: [] },
  }),
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
