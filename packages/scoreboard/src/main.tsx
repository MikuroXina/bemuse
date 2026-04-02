import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { renderToReadableStream } from 'react-dom/server'

import { authModeratorMiddleware } from './middleware'
import { router as authRouter } from './routes/auth'
import { router as moderationRouter } from './routes/moderation'
import { router as scoreboardRouter } from './routes/scoreboard'
import { View } from './view'

const app = new Hono()

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  console.error(`fatal error: ${err.message}`, {
    method: c.req.method,
    path: c.req.path,
    name: err.name,
    stack: err.stack,
    cause: err.cause,
  })
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
