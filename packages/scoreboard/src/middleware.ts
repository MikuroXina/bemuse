import { UserInfoClient } from 'auth0'
import { env } from 'hono/adapter'
import { every } from 'hono/combine'
import { cors } from 'hono/cors'
import { createMiddleware } from 'hono/factory'

import type { Env, EnvVars } from './env'

export const corsMiddleware = createMiddleware<Env>((c, next) =>
  cors({
    origin: env<EnvVars>(c).DEV ? ['localhost:5173'] : ['bemuse.pages.dev'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Upgrade-Insecure-Requests', 'Content-Type'],
    exposeHeaders: ['Content-Length'],
    credentials: true,
    maxAge: 24 * 60 * 60,
  })(c, next)
)

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const authorization = c.req.header('Authorization')
  if (!authorization || !authorization.startsWith('Bearer ')) {
    console.error({ authorization })
    return c.text('Unauthorized', 401)
  }
  const accessToken = authorization.slice('Bearer '.length)
  c.set('accessToken', accessToken)
  return next()
})

const checkModeratorMiddleware = createMiddleware<Env>(async (c, next) => {
  const accessToken = c.get('accessToken')
  if (!accessToken) {
    return c.text('Unauthorized', 401)
  }

  const { VITE_AUTH0_DOMAIN } = env<EnvVars>(c)
  const res = await new UserInfoClient({
    domain: VITE_AUTH0_DOMAIN,
  }).getUserInfo(accessToken)
  if (res.status !== 200) {
    return c.text('Unauthorized', 401)
  }

  const user = res.data
  const isModerator =
    user.email_verified && user.email === 'mikuroxina@gmail.com'
  if (!isModerator) {
    return c.text('Forbidden', 403)
  }
  return await next()
})

export const authModeratorMiddleware = every(
  authMiddleware,
  checkModeratorMiddleware
)
