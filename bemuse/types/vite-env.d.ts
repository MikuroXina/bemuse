/// <reference types="vite/client" />

interface ImportMetaEnv {
  SCOREBOARD_SERVER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const _BEMUSE_BUILD_VERSION: string
declare const _BEMUSE_BUILD_NAME: string
