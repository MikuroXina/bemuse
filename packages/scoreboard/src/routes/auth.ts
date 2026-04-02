import { sValidator } from '@hono/standard-validator'
import { Auth } from '@mikuroxina/scoreboard-types'
import { ManagementClient, UserInfoClient } from 'auth0'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cache } from 'hono/cache'
import type { InferOutput } from 'valibot'

import type { Env, Variables } from '../env'
import { authMiddleware, corsMiddleware } from '../middleware'

export const router = new Hono<Env>().basePath('/api/v1/auth')

router.use(corsMiddleware)
router.use(authMiddleware)

router
  .get(
    '/users/me',
    cache({
      cacheName: 'user-info',
      cacheControl: 'max-age=86400',
    }),
    async (c) => {
      const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
        env<Variables>(c)

      const user = await new UserInfoClient({
        domain: VITE_AUTH0_DOMAIN,
      }).getUserInfo(c.get('accessToken'))
      if (user.status !== 200) {
        console.error(user.data)
        return c.text('Unauthorized', 401)
      }

      const userId = user.data.sub

      const management = new ManagementClient({
        domain: VITE_AUTH0_DOMAIN,
        clientId: VITE_AUTH0_CLIENT_ID,
        clientSecret: AUTH0_CLIENT_SECRET,
      })
      const res = await management.users.get(userId)
      const ret: InferOutput<typeof Auth.userInfoSchema> = {
        id: res.user_id! as Auth.UserId,
        name: res.name!,
        created_at: res.created_at! as string,
        is_frozen: res.blocked ?? false,
      }
      return c.json(ret)
    }
  )
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
    const data: InferOutput<typeof Auth.updateUserResponseSchema> = {
      id: res.user_id! as Auth.UserId,
      name: res.name!,
      created_at: res.created_at! as string,
      is_frozen: res.blocked ?? false,
    }
    return c.json(data)
  })
