import { auth, type OIDCEnv, requiresAuth } from '@auth0/auth0-hono'
import type { Context } from 'hono'
import { env } from 'hono/adapter'
import { createMiddleware } from 'hono/factory'

import type { Bindings, Env } from './env'

export const authMiddleware = createMiddleware<{ Variables: Env }>(
  (c, next) => {
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
      routes: {
        login: '/api/v1/auth/login',
        callback: '/api/v1/auth/callback',
        logout: '/api/v1/auth/logout',
      },
      session: {
        secret: SESSION_SECRET,
      },
      authRequired: false,
      errorOnRequiredAuth: false,
      attemptSilentLogin: true,
    })(c, next)
  }
)

async function checkModerator(
  c: Context<OIDCEnv<Bindings>>
): Promise<Response | null> {
  const user = await c.get('auth0Client')!.getUser()
  if (!user) {
    return c.text('Unauthorized', 401)
  }

  const isModerator =
    user.email_verified && user.email === 'mikuroxina@gmail.com'
  if (!isModerator) {
    return c.text('Forbidden', 403)
  }
  return null
}

export const requiresModeratorAuth = (behavior?: 'error' | 'login') =>
  createMiddleware<OIDCEnv<Bindings>>(async (c, next) => {
    const res1 = await requiresAuth(behavior)(c, next)
    if (res1) {
      return res1
    }
    const res2 = await checkModerator(c)
    if (res2) {
      return res2
    }
    return await next()
  })
