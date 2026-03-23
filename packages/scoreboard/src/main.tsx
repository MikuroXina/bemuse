import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { renderToReadableStream } from 'react-dom/server'

import { authMiddleware, authModeratorMiddleware } from './middleware'
import { router as authRouter } from './routes/auth'
import { router as moderationRouter } from './routes/moderation'
import { router as scoreboardRouter } from './routes/scoreboard'
import { View } from './view'

const app = new Hono()

app.use((c, next) =>
  cors({
    origin: env(c).DEV ? ['localhost:5173'] : ['bemuse.pages.dev'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    credentials: true,
  })(c, next)
)
app.use(authMiddleware)
app.onError((err, c) => {
  console.error(err)
  if (err instanceof HTTPException) {
    if (env(c).NODE_ENV === 'development') {
      return err.getResponse()
    }
  }
  return c.text('Internal Server Error', 500)
})

app.route('/', authRouter)
app.route('/', moderationRouter)
app.route('/', scoreboardRouter)

app.get('/moderation', authModeratorMiddleware, async () => {
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
