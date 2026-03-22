import { Auth0Exception } from '@auth0/auth0-hono'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'
import { renderToReadableStream } from 'react-dom/server'

import { router as authRouter } from './auth'
import { authMiddleware, requiresModeratorAuth } from './middleware'
import { router as moderationRouter } from './moderation'
import { router as scoreboardRouter } from './scoreboard'
import { View } from './view'

const app = new Hono()

app.use(
  cors({
    origin: import.meta.env.DEV ? ['localhost:5173'] : ['bemuse.pages.dev'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    credentials: true,
  })
)
app.use(authMiddleware)
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

app.get('/moderation', requiresModeratorAuth(), async () => {
  const stream = await renderToReadableStream(
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </head>
      <body>
        <div id='root'>
          <View />
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
