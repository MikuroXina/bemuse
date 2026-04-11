import { sValidator } from '@hono/standard-validator'
import { Auth, Moderation } from '@mikuroxina/scoreboard-types'
import { ManagementClient } from 'auth0'
import { type Context, Hono } from 'hono'
import { env } from 'hono/adapter'
import type { InferOutput } from 'valibot'

import { idProvider, userQuery, userRepo } from '../adaptor/auth0'
import type { Env, EnvVars } from '../env'
import { authModeratorMiddleware } from '../middleware'
import { freezeUser, inspectUser, unfreezeUser } from '../service/moderation'

export const router = new Hono<Env>().basePath('/api/v1/moderation')

router.use(authModeratorMiddleware)

router.get(
  '/users',
  sValidator('param', Moderation.listUsersParameterSchema),
  async (c) => {
    const { since = '*', until = '*', name = '' } = c.req.valid('param')
    const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
      env<EnvVars>(c)

    const management = new ManagementClient({
      domain: VITE_AUTH0_DOMAIN,
      clientId: VITE_AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
    })
    const pages = await management.users.list({
      page: 0,
      per_page: 20,
      sort: 'created_at:-1',
      q:
        name === ''
          ? `created_at:[${since} TO ${until}}`
          : `name:"${name}"~ AND created_at:[${since} TO ${until}}`,
      search_engine: 'v3',
    })
    const ret: InferOutput<typeof Moderation.listUsersResponseSchema> = []
    for await (const page of pages) {
      ret.push({
        id: page.user_id! as Auth.UserId,
        name: page.name!,
        created_at: page.created_at! as string,
        is_frozen: page.blocked ?? false,
      })
    }
    return c.json(ret)
  }
)

router.get('/users/:user_id', async (c: Context<Env>) => {
  const userId = c.req.param('user_id')
  if (userId == null || userId === '') {
    return c.text('Bad Request', 400)
  }

  const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
    env<EnvVars>(c)

  return c.json(
    await inspectUser({
      accessToken: c.get('accessToken'),
      idp: idProvider(VITE_AUTH0_DOMAIN),
      userRepo: userQuery({
        auth0Domain: VITE_AUTH0_DOMAIN,
        auth0ClientId: VITE_AUTH0_CLIENT_ID,
        auth0ClientSecret: AUTH0_CLIENT_SECRET,
      }),
      score: c.env.score,
    })
  )
})

router.post(
  '/users/:user_id/freeze',
  sValidator('param', Moderation.freezeParameterSchema),
  async (c) => {
    const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
      env<EnvVars>(c)
    await freezeUser({
      param: c.req.valid('param'),
      score: c.env.score,
      userRepo: userRepo({
        auth0Domain: VITE_AUTH0_DOMAIN,
        auth0ClientId: VITE_AUTH0_CLIENT_ID,
        auth0ClientSecret: AUTH0_CLIENT_SECRET,
      }),
    })
    return c.text('OK')
  }
)

router.post(
  '/users/:user_id/unfreeze',
  sValidator('param', Moderation.unfreezeParameterSchema),
  async (c) => {
    const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
      env<EnvVars>(c)
    await unfreezeUser({
      param: c.req.valid('param'),
      score: c.env.score,
      userRepo: userRepo({
        auth0Domain: VITE_AUTH0_DOMAIN,
        auth0ClientId: VITE_AUTH0_CLIENT_ID,
        auth0ClientSecret: AUTH0_CLIENT_SECRET,
      }),
    })
    return c.text('OK')
  }
)
