import { Hono } from 'hono'

const app = new Hono()

app.get('/', (ctx) => ctx.text('Hello, world!'))

export default app
