import type { SongMetadata } from "@mikuroxina/bemuse-types"
import type { SoundAssetsMetadata } from "~/lib/types"

export type SubsystemProgress = [state: 'awaiting'] | [state: 'processing', message: string]

export interface State {
  usingDir: FileSystemDirectoryHandle | null
  soundAssets: SoundAssetsMetadata | null
  songMeta: SongMetadata | null
  songOgg: string | null;
  previewMp3: string | null
  readme: string
  extractProgress: SubsystemProgress
  convertProgress: SubsystemProgress
  indexProgress: SubsystemProgress
  renderProgress: SubsystemProgress
  createPreviewProgress: SubsystemProgress
  scanVisualFilesProgress : SubsystemProgress
}

export const initialState: State = {
  usingDir: null,
  soundAssets: null,
  songMeta: null,
  songOgg: null,
  previewMp3: null,
  readme: "",
  extractProgress: ["awaiting"],
  convertProgress: ["awaiting"],
  indexProgress:["awaiting"],
  renderProgress:["awaiting"],
  createPreviewProgress:["awaiting"],
  scanVisualFilesProgress: ["awaiting"],
}

const reducers = {
  OPEN: (state: State, dir: FileSystemDirectoryHandle) => ({...state, usingDir: dir}),
  START_EXTRACT: (state: State, _: never[]) => ({...state, extractProgress: ["processing", "Loading your BMS package"] }),
  DONE_EXTRACT: (state: State, props: {
    soundAssets: SoundAssetsMetadata | null,
    songMeta: SongMetadata | null,
    readme: string,
    songOgg: string | null,
    previewMp3: string | null,
  }) => ({ ...state, ...props, extractProgress: ["awaiting"] }),
  CLOSE: (_state: State, _: never[]) => initialState,
} as const satisfies Record<string, (state: State, action: any) => State>;

type Reducers = typeof reducers;
type Payload<K extends keyof Reducers> = Reducers[K] extends (
  state: State,
  action: infer A
) => State
  ? A
  : never;

export type Action = {
  [K in keyof Reducers]: [K, Payload<K>];
}[keyof Reducers];

export type Dispatcher = (action: Action) => void;

export const reducer = (
  state: State,
  [kind, payload]: Action,
): State => reducers[kind](state, payload as Payload<typeof kind>);
