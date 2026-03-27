/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_AUTH0_DOMAIN: string
  VITE_AUTH0_CLIENT_ID: string
  VITE_SCOREBOARD_SERVER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const _BEMUSE_BUILD_VERSION: string
declare const _BEMUSE_BUILD_NAME: string
