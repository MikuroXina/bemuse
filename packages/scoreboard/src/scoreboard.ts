import { type OIDCEnv, requiresAuth } from '@auth0/auth0-hono'
import { sValidator } from '@hono/standard-validator'
import { Scoreboard } from '@mikuroxina/scoreboard-types'
import { type Context, Hono } from 'hono'
import { type InferInput, type InferOutput, parse } from 'valibot'

import type { Bindings } from './env'

export const router = new Hono<{ Bindings: Bindings }>()

router.get('/:chart_id/:play_mode', async (c) => {
  const { chart_id, play_mode } = c.req.param()
  const select = await c.env.score
    .prepare(
      `
    SELECT
      id,
      created_at,
      user_id,
      chart_id,
      play_mode,
      count_meticulous,
      count_precise,
      count_good,
      count_offbeat,
      count_missed,
      log,
      MAX(score) AS score,
      max_combo,
      total_combo,
      RANK() OVER (ORDER BY score DESC, create_at DESC) AS rank
    FROM
      score_record
    WHERE
      chart_id = ? AND play_mode = ?
    GROUP BY
      user_id
    ORDER BY
      score DESC,
      created_at DESC;
    `
    )
    .bind(chart_id, play_mode)
    .run()

  const ret: unknown[] = []
  for (const result of select.results) {
    ret.push({
      rank: result.rank,
      entry: {
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
            offbeat: result.count_offbeat,
            missed: result.count_missed,
          },
          log: result.log,
        },
        recorded_by: result.user_id,
        chart_md5: result.chart_id,
        play_mode: result.play_mode,
      },
    })
  }
  return c.json(parse(Scoreboard.getLeaderboardResponseSchema, ret))
})

router.post(
  '/:chart_id/:play_mode',
  requiresAuth(),
  sValidator('json', Scoreboard.submitScoreRequestBodySchema),
  async (
    c: Context<
      OIDCEnv<Bindings>,
      '/:chart_id/:play_mode',
      {
        in: { json: InferInput<typeof Scoreboard.submitScoreRequestBodySchema> }
        out: {
          json: InferOutput<typeof Scoreboard.submitScoreRequestBodySchema>
        }
      }
    >
  ) => {
    const userId = (await c.var.auth0Client?.getUser())?.sub
    if (!userId) {
      return c.text('Unauthorized', 401)
    }

    const { chart_id, play_mode } = c.req.param()
    const { score, combo, total, count, log } = c.req.valid('json')

    await c.env.score
      .prepare(
        `
        INSERT INTO
          chart (id, title)
        VALUES
          (?, ?)
        ON CONFLICT (id)
          DO NOTHING;
        `
      )
      .bind(chart_id)
      .run()

    const newRecordId = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    await c.env.score
      .prepare(
        `
        INSERT INTO
          score_record (
            id,
            created_at,
            user_id,
            chart_id,
            play_mode,
            count_meticulous,
            count_precise,
            count_good,
            count_offbeat,
            count_missed,
            log,
            score,
            max_combo,
            total_combo
          )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `
      )
      .bind(
        newRecordId,
        createdAt,
        userId,
        chart_id,
        play_mode,
        count.meticulous,
        count.precise,
        count.good,
        count.offbeat,
        count.missed,
        log,
        score,
        combo,
        total
      )
      .run()

    const select = await c.env.score
      .prepare(
        `
      SELECT
        RANK() OVER (ORDER BY score DESC, created_at DESC) AS rank
      FROM
        score_record
      WHERE
        chart_id = ? AND play_mode = ?
      GROUP BY
        user_id
      HAVING
        user_id = ?
      `
      )
      .bind(chart_id, play_mode, userId)
      .first()
    if (!select) {
      throw new Error('insertion failed')
    }

    const ret = {
      rank: select.rank,
      entry: {
        id: newRecordId,
        created_at: createdAt,
        score: {
          score,
          combo,
          total,
          count,
          log,
        },
        recorded_by: userId,
        chart_md5: chart_id,
        play_mode: play_mode,
      },
    }
    return c.json(parse(Scoreboard.submitScoreResponseSchema, ret))
  }
)

router.get('/:chart_id/:play_mode/:user_id', async (c) => {
  const { chart_id, play_mode, user_id } = c.req.param()
  const result = await c.env.score
    .prepare(
      `
    SELECT
      id,
      created_at,
      user_id,
      chart_id,
      play_mode,
      count_meticulous,
      count_precise,
      count_good,
      count_offbeat,
      count_missed,
      log,
      MAX(score),
      max_combo,
      total_combo,
      RANK() OVER (ORDER BY score DESC) AS rank
    FROM
      score_record
    WHERE
      chart_id = ? AND play_mode = ?
    GROUP BY
      user_id
    ORDER BY
      score DESC
    HAVING
      user_id = ?
    LIMIT
      1;
    `
    )
    .bind(chart_id, play_mode, user_id)
    .first()

  if (result == null) {
    return c.text('Not Found', 404)
  }

  const ret: unknown = {
    rank: result.rank,
    entry: {
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
          offbeat: result.count_offbeat,
          missed: result.count_missed,
        },
        log: result.log,
      },
      recorded_by: result.user_id,
      chart_md5: result.chart_id,
      play_mode: result.play_mode,
    },
  }
  return c.json(parse(Scoreboard.getScoreResponseSchema, ret))
})
