/// <reference types="vite/client" />

interface ImportMetaEnv {
  SCOREBOARD_SERVER?: string
  BEMUSE_BUILD_VERSION: string
  BEMUSE_BUILD_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
