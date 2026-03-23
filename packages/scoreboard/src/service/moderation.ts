import { Moderation } from '@mikuroxina/scoreboard-types'
import { HTTPException } from 'hono/http-exception'
import { type InferOutput, parse } from 'valibot'

import type { IDProvider } from '../interface/idp'
import type { UserRepository } from '../interface/user'

export const inspectUser = async ({
  accessToken,
  idp,
  userRepo,
  score,
}: {
  accessToken: string
  idp: IDProvider
  userRepo: UserRepository
  score: D1Database
}): Promise<InferOutput<typeof Moderation.inspectUserResponseSchema>> => {
  const userId = await idp.userId(accessToken)
  if (!userId) {
    throw new HTTPException(401)
  }

  const select = await score
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

  const info = userRepo.userInfo(userId)

  const ret: unknown = { info, plays }
  return parse(Moderation.inspectUserResponseSchema, ret)
}
