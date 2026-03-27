import { Auth, Scoreboard } from '@mikuroxina/scoreboard-types'
import { HTTPException } from 'hono/http-exception'
import type { InferOutput } from 'valibot'

import type { IDProvider } from '../interface/idp'
import type { UserRepository } from '../interface/user'

export const getLeaderboard = async ({
  param: { chart_md5: chartId, play_mode: playMode },
  score,
  userRepo,
}: {
  param: InferOutput<typeof Scoreboard.getLeaderboardParameterSchema>
  score: D1Database
  userRepo: UserRepository
}): Promise<InferOutput<typeof Scoreboard.getLeaderboardResponseSchema>> => {
  const select = await score
    .prepare(
      `
    SELECT
      score_record.id as id,
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
      JOIN
        user_frozen
      ON
        score_record.user_id = user_frozen.id
    WHERE
      chart_id = ? AND play_mode = ? AND user_frozen.frozen IS NOT TRUE
    GROUP BY
      user_id
    ORDER BY
      score DESC,
      created_at DESC;
    `
    )
    .bind(chartId, playMode)
    .run<{
      id: Scoreboard.ScoreboardEntryId
      created_at: string
      user_id: Auth.UserId
      chart_id: string
      play_mode: Scoreboard.PlayMode
      count_meticulous: number
      count_precise: number
      count_good: number
      count_offbeat: number
      count_missed: number
      log: string | null
      score: number
      max_combo: number
      total_combo: number
      rank: number
    }>()

  const userInfos = await userRepo.userInfoBatch(
    select.results.map((result) => result.user_id)
  )

  const ret: InferOutput<typeof Scoreboard.getLeaderboardResponseSchema> = []
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
          log: result.log ?? undefined,
        },
        recorded_by: userInfos[result.user_id]!,
        chart_md5: result.chart_id,
        play_mode: result.play_mode,
      },
    })
  }
  return ret
}

export const submitScore = async ({
  param: { chart_md5: chartId, play_mode: playMode },
  db,
  toSubmit,
  accessToken,
  idp,
  userRepo,
}: {
  param: InferOutput<typeof Scoreboard.submitScoreParameterSchema>
  db: D1Database
  toSubmit: InferOutput<typeof Scoreboard.submitScoreRequestBodySchema>
  accessToken: string
  idp: IDProvider
  userRepo: UserRepository
}): Promise<InferOutput<typeof Scoreboard.submitScoreResponseSchema>> => {
  const userId = await idp.userId(accessToken)
  if (userId == null) {
    throw new HTTPException(401)
  }

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
      log ?? null,
      score,
      combo,
      total
    )
    .run()

  const rankSelect = await db
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
        user_id = ?;
      `
    )
    .bind(chartId, playMode, userId)
    .first<{ rank: number }>()
  const playCountSelect = await db
    .prepare(
      `
      SELECT
        COUNT(*) as play_count
      FROM
        score_record
      WHERE
        chart_id = ? AND play_mode = ? AND user_id = ?;
      `
    )
    .bind(chartId, playMode, userId)
    .first<{ play_count: number }>()
  if (!rankSelect || !playCountSelect) {
    throw new Error('insertion failed')
  }

  const { name } = await userRepo.userInfo(userId)
  const ret: InferOutput<typeof Scoreboard.submitScoreResponseSchema> = {
    rank: rankSelect.rank,
    entry: {
      id: newRecordId as Scoreboard.ScoreboardEntryId,
      created_at: createdAt,
      score: {
        score,
        combo,
        total,
        count,
        log,
      },
      recorded_by: {
        id: userId,
        name,
      },
      chart_md5: chartId,
      play_mode: playMode,
    },
    play_nth: playCountSelect.play_count,
    play_count: playCountSelect.play_count,
  }
  return ret
}

export const getScore = async ({
  param: { chart_md5: chartId, play_mode: playMode, user_id: userId },
  score,
  userRepo,
}: {
  param: InferOutput<typeof Scoreboard.getScoreParameterSchema>
  score: D1Database
  userRepo: UserRepository
}): Promise<InferOutput<typeof Scoreboard.getScoreResponseSchema> | null> => {
  const highScoreSelect = await score
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
      MAX(score) as score,
      max_combo,
      total_combo,
      RANK() OVER (ORDER BY score DESC) AS rank
    FROM
      score_record
    WHERE
      chart_id = ? AND play_mode = ?
    GROUP BY
      user_id
    HAVING
      user_id = ?
    ORDER BY
      score DESC
    LIMIT
      1;
    `
    )
    .bind(chartId, playMode, userId)
    .first<{
      id: Scoreboard.ScoreboardEntryId
      created_at: string
      user_id: Auth.UserId
      chart_id: string
      play_mode: Scoreboard.PlayMode
      count_meticulous: number
      count_precise: number
      count_good: number
      count_offbeat: number
      count_missed: number
      log: string | null
      score: number
      max_combo: number
      total_combo: number
      rank: number
    }>()
  if (highScoreSelect == null) {
    return null
  }

  const playCountSelect = await score
    .prepare(
      `
    SELECT
      COUNT(*) AS play_count
    FROM
      score_record
    WHERE
      chart_id = ? AND play_mode = ? AND user_id = ?;
    `
    )
    .bind(chartId, playMode, userId)
    .first<{ play_count: number }>()
  const playNthSelect = await score
    .prepare(
      `
    SELECT
      (ROW_NUMBER() OVER (ORDER BY created_at DESC)) + 1 as play_nth
    FROM
      score_record
    WHERE
      chart_id = ? AND play_mode = ? AND user_id = ?;
    `
    )
    .bind(chartId, playMode, userId)
    .first<{ play_nth: number }>()
  if (playCountSelect == null || playNthSelect == null) {
    return null
  }

  const userInfo = await userRepo.userInfo(highScoreSelect.user_id)

  const ret: InferOutput<typeof Scoreboard.getScoreResponseSchema> = {
    rank: highScoreSelect.rank,
    entry: {
      id: highScoreSelect.id,
      created_at: highScoreSelect.created_at,
      score: {
        score: highScoreSelect.score,
        combo: highScoreSelect.max_combo,
        total: highScoreSelect.total_combo,
        count: {
          meticulous: highScoreSelect.count_meticulous,
          precise: highScoreSelect.count_precise,
          good: highScoreSelect.count_good,
          offbeat: highScoreSelect.count_offbeat,
          missed: highScoreSelect.count_missed,
        },
        log: highScoreSelect.log ?? undefined,
      },
      recorded_by: userInfo,
      chart_md5: highScoreSelect.chart_id,
      play_mode: highScoreSelect.play_mode,
    },
    play_nth: playNthSelect.play_nth,
    play_count: playCountSelect.play_count,
  }
  return ret
}
