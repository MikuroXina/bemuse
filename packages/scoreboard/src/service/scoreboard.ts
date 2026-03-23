import { Scoreboard } from '@mikuroxina/scoreboard-types'
import { type InferOutput, parse } from 'valibot'

import type { IDProvider } from '../interface/idp'

export const getLeaderboard = async ({
  param: { chart_md5: chartId, play_mode: playMode },
  score,
}: {
  param: InferOutput<typeof Scoreboard.getLeaderboardParameterSchema>
  score: D1Database
}): Promise<InferOutput<typeof Scoreboard.getLeaderboardResponseSchema>> => {
  const select = await score
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
      RANK() OVER (ORDER BY score DESC, created_at DESC) AS rank
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
    .bind(chartId, playMode)
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
  return parse(Scoreboard.getLeaderboardResponseSchema, ret)
}

export const submitScore = async ({
  param: { chart_md5: chartId, play_mode: playMode },
  db,
  toSubmit,
  accessToken,
  idp,
}: {
  param: InferOutput<typeof Scoreboard.submitScoreParameterSchema>
  db: D1Database
  toSubmit: InferOutput<typeof Scoreboard.submitScoreRequestBodySchema>
  accessToken: string
  idp: IDProvider
}): Promise<InferOutput<typeof Scoreboard.submitScoreResponseSchema>> => {
  const userId = await idp.userId(accessToken)
  const { score, combo, total, count, log } = toSubmit

  const newRecordId = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  await db
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
      chartId,
      playMode,
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

  const select = await db
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
    .bind(chartId, playMode, userId)
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
      chart_md5: chartId,
      play_mode: playMode,
    },
  }
  return parse(Scoreboard.submitScoreResponseSchema, ret)
}

export const getScore = async ({
  param: { chart_md5: chartId, play_mode: playMode, user_id: userId },
  score,
}: {
  param: InferOutput<typeof Scoreboard.getScoreParameterSchema>
  score: D1Database
}): Promise<InferOutput<typeof Scoreboard.getScoreResponseSchema> | null> => {
  const result = await score
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
    .bind(chartId, playMode, userId)
    .first()

  if (result == null) {
    return null
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
  return parse(Scoreboard.getScoreResponseSchema, ret)
}
