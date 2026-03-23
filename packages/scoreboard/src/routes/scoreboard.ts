import { sValidator } from '@hono/standard-validator'
import { Scoreboard } from '@mikuroxina/scoreboard-types'
import { Hono } from 'hono'
import { env } from 'hono/adapter'

import { idProvider } from '../adaptor/auth0'
import type { Bindings, EnvVars } from '../env'
import { authMiddleware } from '../middleware'
import { getLeaderboard, getScore, submitScore } from '../service/scoreboard'

export const router = new Hono<{ Bindings: Bindings }>().basePath(
  '/api/v1/scoreboard'
)

router.get(
  '/:chart_md5/:play_mode',
  sValidator('param', Scoreboard.getLeaderboardParameterSchema),
  async (c) =>
    c.json(
      await getLeaderboard({
        param: c.req.valid('param'),
        score: c.env.score,
      })
    )
)

router.post(
  '/:chart_id/:play_mode',
  authMiddleware,
  sValidator('param', Scoreboard.submitScoreParameterSchema),
  sValidator('json', Scoreboard.submitScoreRequestBodySchema),
  async (c) => {
    const { VITE_AUTH0_DOMAIN } = env<EnvVars>(c)
    return c.json(
      await submitScore({
        accessToken: c.get('accessToken'),
        param: c.req.valid('param'),
        toSubmit: c.req.valid('json'),
        idp: idProvider(VITE_AUTH0_DOMAIN),
        db: c.env.score,
      })
    )
  }
)

router.get(
  '/:chart_id/:play_mode/:user_id',
  sValidator('param', Scoreboard.getScoreParameterSchema),
  async (c) =>
    c.json(
      await getScore({
        param: c.req.valid('param'),
        score: c.env.score,
      })
    )
)
