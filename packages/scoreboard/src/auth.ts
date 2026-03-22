import { requiresAuth } from '@auth0/auth0-hono'
import { sValidator } from '@hono/standard-validator'
import { Auth } from '@mikuroxina/scoreboard-types'
import { ManagementClient } from 'auth0'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { parse } from 'valibot'

import type { Bindings, Env } from './env'
import { authMiddleware, requiresModeratorAuth } from './middleware'

export const router = new Hono<{ Bindings: Bindings }>().basePath(
  '/api/v1/auth'
)

router.use(authMiddleware)

router.get('/users/me', requiresAuth('error'), async (c) => {
  const user = await c.get('auth0Client')!.getUser()
  if (!user) {
    return c.text('Unauthorized', 401)
  }

  const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
    env<Env>(c)

  const management = new ManagementClient({
    domain: VITE_AUTH0_DOMAIN,
    clientId: VITE_AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
  })
  const res = await management.users.get(user.sub)
  const ret: unknown = {
    id: res.user_id,
    name: res.name,
    created_at: res.created_at,
    frozen: res.blocked ?? false,
  }
  return c.json(parse(Auth.userInfoSchema, ret))
})

router.use('/users/:user_id', requiresModeratorAuth())
router.post(
  '/users/:user_id',
  sValidator('param', Auth.updateUserRequestSchema),
  async (c) => {
    const userId = c.req.param('user_id')
    const { name } = c.req.valid('param')
    const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
      env<Env>(c)

    const management = new ManagementClient({
      domain: VITE_AUTH0_DOMAIN,
      clientId: VITE_AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
    })
    const res = await management.users.update(userId, {
      name,
    })
    const data = {
      id: res.user_id,
      name: res.name,
      created_at: res.created_at,
      is_frozen: res.blocked,
    }
    return c.json(parse(Auth.updateUserResponseSchema, data))
  }
)
