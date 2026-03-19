import { Auth0Exception } from '@auth0/auth0-hono'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { renderToReadableStream } from 'react-dom/server'

import { router as authRouter } from './auth'
import type { Env } from './env'
import { router as moderationRouter } from './moderation'
import { router as scoreboardRouter } from './scoreboard'
import { View } from './view'

const app = new Hono()

app.onError((err, c) => {
  console.error(err)
  if (err instanceof Auth0Exception) {
    if (env(c).NODE_ENV === 'development') {
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
app.get('/moderation/logout', (c) => c.redirect('/moderation'))

export default app
