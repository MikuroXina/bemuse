export type Env = {
  VITE_AUTH0_AUDIENCE: string
  VITE_AUTH0_CLIENT_ID: string
  AUTH0_CLIENT_SECRET: string
  VITE_AUTH0_DOMAIN: string
  SESSION_SECRET: string
}

export type Bindings = {
  score: D1Database
}
