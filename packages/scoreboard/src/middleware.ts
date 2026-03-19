import { auth } from '@auth0/auth0-hono'
import { env } from 'hono/adapter'
import { createMiddleware } from 'hono/factory'

import type { Env } from './env'

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
      session: {
        secret: SESSION_SECRET,
        cookie: {
          sameSite: 'strict',
        },
      },
      authRequired: false,
      errorOnRequiredAuth: false,
      attemptSilentLogin: true,
    })(c, next)
  }
)
