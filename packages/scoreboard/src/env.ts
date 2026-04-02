export type EnvVars = {
  VITE_AUTH0_AUDIENCE: string
  VITE_AUTH0_CLIENT_ID: string
  AUTH0_CLIENT_SECRET: string
  VITE_AUTH0_DOMAIN: string
  DEV?: string
}

export type Variables = EnvVars & {
  accessToken: string
}

export type Bindings = {
  score: D1Database
}

export type Env = {
  Variables: Variables
  Bindings: Bindings
}
