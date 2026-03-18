import { auth, Auth0Exception } from '@auth0/auth0-hono'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { renderToReadableStream } from 'react-dom/server'

import { router as authRouter } from './auth'
import type { Env } from './env'
import { router as moderationRouter } from './moderation'
import { router as scoreboardRouter } from './scoreboard'
import { View } from './view'

const app = new Hono()

app.use((c, next) => {
  const {
    VITE_AUTH0_CLIENT_ID,
    VITE_AUTH0_DOMAIN,
    AUTH0_CLIENT_SECRET,
    SESSION_SECRET,
  } = env<Env>(c)
  return auth({
    domain: VITE_AUTH0_DOMAIN,
    clientID: VITE_AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    baseURL: new URL(c.req.url).origin,
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

app.route('/', authRouter)
app.route('/', moderationRouter)
app.route('/', scoreboardRouter)

app.get('/moderation', async (c) => {
  const { VITE_AUTH0_AUDIENCE, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_DOMAIN } =
    env<Env>(c)
  const stream = await renderToReadableStream(
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </head>
      <body>
        <div id='root'>
          <View
            auth0Audience={VITE_AUTH0_AUDIENCE}
            auth0ClientId={VITE_AUTH0_CLIENT_ID}
            auth0Domain={VITE_AUTH0_DOMAIN}
            baseUrl={new URL(c.req.url).origin}
          />
        </div>
      </body>
    </html>,
    {
      bootstrapModules: ['./static/client.js'],
    }
  )
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
})

export default app
