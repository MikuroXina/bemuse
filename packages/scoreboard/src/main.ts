import { auth, Auth0Exception } from '@auth0/auth0-hono'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { createElement } from 'react'
import { renderToReadableStream } from 'react-dom/server'

import { router as authRouter } from './auth'
import type { Env } from './env'
import { router as moderationRouter } from './moderation'
import { router as scoreboardRouter } from './scoreboard'
import { View } from './view'

const app = new Hono()

app.use((c, next) => {
  const {
    AUTH0_CLIENT_ID,
    AUTH0_DOMAIN,
    AUTH0_CLIENT_SECRET,
    BASE_URL,
    SESSION_SECRET,
  } = env<Env>(c)
  return auth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    baseURL: BASE_URL,
    session: {
      secret: SESSION_SECRET,
    },
    authRequired: false,
    errorOnRequiredAuth: true,
    attemptSilentLogin: true,
  })(c, next)
})
app.onError((err, c) => {
  console.error(err)
  if (err instanceof Auth0Exception) {
    if (process.env.NODE_ENV === 'development') {
      return err.getResponse()
    }
  }
  return c.text('Internal Server Error', 500)
})

app.route('/api/v1/auth', authRouter)
app.route('/api/v1/moderation', moderationRouter)
app.route('/api/v1/scoreboard', scoreboardRouter)

app.get('/moderation', async (c) => {
  const { AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_DOMAIN, BASE_URL } =
    env<Env>(c)
  const stream = await renderToReadableStream(
    createElement(View, {
      auth0Audience: AUTH0_AUDIENCE,
      auth0ClientId: AUTH0_CLIENT_ID,
      auth0Domain: AUTH0_DOMAIN,
      baseUrl: BASE_URL,
    })
  )
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
})

export default app
