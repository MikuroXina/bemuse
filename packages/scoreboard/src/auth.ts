import { auth, requiresAuth } from '@auth0/auth0-hono'
import { sValidator } from '@hono/standard-validator'
import { Auth } from '@mikuroxina/scoreboard-types'
import { ManagementClient } from 'auth0'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { parse } from 'valibot'

import type { Env } from './env'

export const router = new Hono()

router.use((c, next) => {
  const { AUTH0_CLIENT_ID, AUTH0_DOMAIN, AUTH0_CLIENT_SECRET, BASE_URL } =
    env<Env>(c)
  return auth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    baseURL: BASE_URL,
    authRequired: false,
  })(c, next)
})

router.use('/users/:user_id', requiresAuth())
router.post(
  '/users/:user_id',
  sValidator('param', Auth.updateUserRequestSchema),
  async (c) => {
    const userId = c.req.param('user_id')
    const { name } = c.req.valid('param')
    const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } = env<Env>(c)

    const management = new ManagementClient({
      domain: AUTH0_DOMAIN,
      clientId: AUTH0_CLIENT_ID,
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
