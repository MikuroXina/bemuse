import { sValidator } from '@hono/standard-validator'
import { Auth } from '@mikuroxina/scoreboard-types'
import { ManagementClient, UserInfoClient } from 'auth0'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { parse } from 'valibot'

import type { Env, Variables } from '../env'
import { authMiddleware } from '../middleware'

export const router = new Hono<Env>().basePath('/api/v1/auth')

router.use(authMiddleware)

router
  .get('/users/me', async (c) => {
    const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
      env<Variables>(c)

    const user = await new UserInfoClient({
      domain: VITE_AUTH0_DOMAIN,
    }).getUserInfo(c.get('accessToken'))
    if (user.status !== 200) {
      return c.text('Unauthorized', 401)
    }

    const userId = user.data.sub

    const management = new ManagementClient({
      domain: VITE_AUTH0_DOMAIN,
      clientId: VITE_AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
    })
    const res = await management.users.get(userId)
    const ret: unknown = {
      id: res.user_id,
      name: res.name,
      created_at: res.created_at,
      frozen: res.blocked ?? false,
    }
    return c.json(parse(Auth.userInfoSchema, ret))
  })
  .post(sValidator('param', Auth.updateUserRequestSchema), async (c) => {
    const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
      env<Variables>(c)

    const user = await new UserInfoClient({
      domain: VITE_AUTH0_DOMAIN,
    }).getUserInfo(c.get('accessToken'))
    if (user.status !== 200) {
      return c.text('Unauthorized', 401)
    }

    const userId = user.data.sub

    const { name } = c.req.valid('param')

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
  })
