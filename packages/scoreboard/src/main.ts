import { auth } from '@auth0/auth0-hono'
import { Hono } from 'hono'
import { env } from 'hono/adapter'

import { router as authRouter } from './auth'
import type { Env } from './env'
import { router as moderationRouter } from './moderation'
import { router as scoreboardRouter } from './scoreboard'

const app = new Hono()

app.use((c, next) => {
  const { AUTH0_CLIENT_ID, AUTH0_DOMAIN, AUTH0_CLIENT_SECRET, BASE_URL } =
    env<Env>(c)
  return auth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    baseURL: BASE_URL,
    authRequired: false,
  })(c, next)
})

app.route('/api/v1/auth', authRouter)
app.route('/api/v1/moderation', moderationRouter)
app.route('/api/v1/scoreboard', scoreboardRouter)

export default app
