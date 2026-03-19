import { type OIDCEnv } from '@auth0/auth0-hono'
import { sValidator } from '@hono/standard-validator'
import { Moderation } from '@mikuroxina/scoreboard-types'
import { ManagementClient } from 'auth0'
import { type Context, Hono } from 'hono'
import { env } from 'hono/adapter'
import { parse } from 'valibot'

import type { Bindings, Env } from './env'
import { authMiddleware, requiresModeratorAuth } from './middleware'

export const router = new Hono<{ Bindings: Bindings }>().basePath(
  '/api/v1/moderation'
)

router.use(authMiddleware)

router.get(
  '/users',
  sValidator('param', Moderation.listUsersParameterSchema),
  requiresModeratorAuth(),
  async (c) => {
    const { since = '*', until = '*', name = '' } = c.req.valid('param')
    const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
      env<Env>(c)

    const management = new ManagementClient({
      domain: VITE_AUTH0_DOMAIN,
      clientId: VITE_AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
    })
    const pages = await management.users.list({
      page: 0,
      per_page: 100,
      sort: 'created_at:-1',
      q:
        name === ''
          ? `created_at:[${since} TO ${until}}`
          : `name:*"${name}"*,created_at:[${since} TO ${until}}`,
      search_engine: 'v3',
    })
    const ret: unknown[] = []
    for await (const page of pages) {
      ret.push({
        id: page.user_id,
        name: page.name,
        created_at: page.created_at,
        is_frozen: page.blocked ?? false,
      })
    }
    return c.json(parse(Moderation.listUsersResponseSchema, ret))
  }
)

router.get(
  '/users/:user_id',
  requiresModeratorAuth(),
  async (c: Context<OIDCEnv<Bindings>>) => {
    const userId = c.req.param('user_id')
    if (userId == null || userId === '') {
      return c.text('Bad Request', 400)
    }

    const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
      env<Env>(c)

    const select = await c.env.score
      .prepare(
        `
        SELECT
          id, created_at, user_id, chart_id, play_mode, count_meticulous, count_precise, count_good, count_offbeat, count_missed, score, max_combo, total_combo
        FROM
          score_record
        WHERE
          user_id = ?
        ORDER BY
          created_at DESC;
      `
      )
      .bind(userId)
      .run()

    const plays: unknown[] = []
    for (const result of select.results) {
      plays.push({
        id: result.id,
        created_at: result.created_at,
        score: {
          score: result.score,
          combo: result.max_combo,
          total: result.total_combo,
          count: {
            meticulous: result.count_meticulous,
            precise: result.count_precise,
            good: result.count_good,
            offbeat: result.offbeat,
            missed: result.missed,
          },
          log: result.log,
        },
        recorded_by: result.user_id,
        chart_md5: result.chart_id,
        play_mode: result.play_mode,
      })
    }

    const management = new ManagementClient({
      domain: VITE_AUTH0_DOMAIN,
      clientId: VITE_AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
    })
    const user = await management.users.get(userId)
    const ret = {
      info: {
        id: user.user_id,
        name: user.name,
        created_at: user.created_at,
        is_frozen: user.blocked ?? false,
      },
      plays,
    }
    return c.json(parse(Moderation.inspectUserResponseSchema, ret))
  }
)

router.post(
  '/users/:user_id/freeze',
  requiresModeratorAuth(),
  async (c: Context<OIDCEnv<Bindings>>) => {
    const userId = c.req.param('user_id')
    if (userId == null || userId === '') {
      return c.text('Bad Request', 400)
    }

    const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
      env<Env>(c)
    const management = new ManagementClient({
      domain: VITE_AUTH0_DOMAIN,
      clientId: VITE_AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
    })
    await management.users.update(userId, {
      blocked: true,
    })

    return c.text('OK')
  }
)

router.post(
  '/users/:user_id/unfreeze',
  requiresModeratorAuth(),
  async (c: Context<OIDCEnv<Bindings>>) => {
    const userId = c.req.param('user_id')
    if (userId == null || userId === '') {
      return c.text('Bad Request', 400)
    }

    const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
      env<Env>(c)
    const management = new ManagementClient({
      domain: VITE_AUTH0_DOMAIN,
      clientId: VITE_AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
    })
    await management.users.update(userId, {
      blocked: false,
    })

    return c.text('OK')
  }
)
