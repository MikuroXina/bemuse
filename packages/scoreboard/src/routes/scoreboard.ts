import { sValidator } from '@hono/standard-validator'
import { Scoreboard } from '@mikuroxina/scoreboard-types'
import { Hono } from 'hono'
import { env } from 'hono/adapter'

import { idProvider, userRepo } from '../adaptor/auth0'
import type { Bindings, EnvVars } from '../env'
import { authMiddleware } from '../middleware'
import { getLeaderboard, getScore, submitScore } from '../service/scoreboard'

export const router = new Hono<{ Bindings: Bindings }>().basePath(
  '/api/v1/scoreboard'
)

router.get(
  '/:chart_md5/:play_mode',
  sValidator('param', Scoreboard.getLeaderboardParameterSchema),
  async (c) => {
    const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
      env<EnvVars>(c)
    return c.json(
      await getLeaderboard({
        param: c.req.valid('param'),
        score: c.env.score,
        userRepo: userRepo({
          auth0Domain: VITE_AUTH0_DOMAIN,
          auth0ClientId: VITE_AUTH0_CLIENT_ID,
          auth0ClientSecret: AUTH0_CLIENT_SECRET,
        }),
      })
    )
  }
)

router.post(
  '/:chart_md5/:play_mode',
  authMiddleware,
  sValidator('param', Scoreboard.submitScoreParameterSchema),
  sValidator('json', Scoreboard.submitScoreRequestBodySchema),
  async (c) => {
    const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
      env<EnvVars>(c)
    return c.json(
      await submitScore({
        accessToken: c.get('accessToken'),
        param: c.req.valid('param'),
        toSubmit: c.req.valid('json'),
        idp: idProvider(VITE_AUTH0_DOMAIN),
        userRepo: userRepo({
          auth0Domain: VITE_AUTH0_DOMAIN,
          auth0ClientId: VITE_AUTH0_CLIENT_ID,
          auth0ClientSecret: AUTH0_CLIENT_SECRET,
        }),
        db: c.env.score,
      })
    )
  }
)

router.get(
  '/:chart_md5/:play_mode/:user_id',
  sValidator('param', Scoreboard.getScoreParameterSchema),
  async (c) => {
    const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } =
      env<EnvVars>(c)
    return c.json(
      await getScore({
        param: c.req.valid('param'),
        score: c.env.score,
        userRepo: userRepo({
          auth0Domain: VITE_AUTH0_DOMAIN,
          auth0ClientId: VITE_AUTH0_CLIENT_ID,
          auth0ClientSecret: AUTH0_CLIENT_SECRET,
        }),
      })
    )
  }
)
