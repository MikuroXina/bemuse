export type Env = {
  AUTH0_AUDIENCE: string
  AUTH0_CLIENT_ID: string
  AUTH0_CLIENT_SECRET: string
  AUTH0_DOMAIN: string
  BASE_URL: string
  SESSION_SECRET: string
}

export type Bindings = {
  score: D1Database
}
