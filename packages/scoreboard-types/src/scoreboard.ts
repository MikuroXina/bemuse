import * as v from 'valibot'

import { userIdSchema } from './auth'

export const playModeSchema = v.union([
  v.literal('KB'),
  v.literal('BM'),
  v.literal('TS'),
])
export type PlayMode = v.InferOutput<typeof playModeSchema>

export const scoreCountSchema = v.object({
  meticulous: v.pipe(v.number(), v.integer()),
  precise: v.pipe(v.number(), v.integer()),
  good: v.pipe(v.number(), v.integer()),
  offbeat: v.pipe(v.number(), v.integer()),
  missed: v.pipe(v.number(), v.integer()),
})
export type ScoreCount = v.InferOutput<typeof scoreCountSchema>

export const logSchema = v.pipe(v.string(), v.regex(/^[ABCDM]+$/))
export type Log = v.InferOutput<typeof logSchema>

export const scoreSchema = v.object({
  score: v.pipe(v.number(), v.integer()),
  combo: v.pipe(v.number(), v.integer()),
  total: v.pipe(v.number(), v.integer()),
  count: scoreCountSchema,
  log: v.optional(logSchema),
})
export type Score = v.InferOutput<typeof scoreSchema>

export const scoreboardEntryIdSchema = v.pipe(
  v.string(),
  v.brand('ScoreboardEntryId')
)
export type ScoreboardEntryId = v.InferOutput<typeof scoreboardEntryIdSchema>

export const md5HashSchema = v.pipe(v.string(), v.regex(/[0-9a-z]{32}/))

export const scoreboardEntrySchema = v.object({
  id: scoreboardEntryIdSchema,
  created_at: v.pipe(v.string(), v.isoTimestamp()),
  score: scoreSchema,
  recorded_by: v.object({
    id: userIdSchema,
    name: v.string(),
  }),
  chart_md5: md5HashSchema,
  play_mode: playModeSchema,
})
export type ScoreboardEntry = v.InferOutput<typeof scoreboardEntrySchema>

export const scoreboardRowSchema = v.object({
  rank: v.pipe(v.number(), v.integer()),
  entry: scoreboardEntrySchema,
})
export type ScoreboardRow = v.InferOutput<typeof scoreboardRowSchema>

export const playStatsSchema = v.object({
  /** Index of play records */
  play_nth: v.pipe(v.number(), v.integer()),
  /** Total number of play records */
  play_count: v.pipe(v.number(), v.integer()),
})
export type PlayStats = v.InferOutput<typeof playStatsSchema>

export const getLeaderboardParameterSchema = v.object({
  chart_md5: md5HashSchema,
  play_mode: playModeSchema,
})
export const getLeaderboardResponseSchema = v.array(scoreboardRowSchema)

export const submitScoreParameterSchema = v.object({
  chart_md5: md5HashSchema,
  play_mode: playModeSchema,
})
export const submitScoreRequestBodySchema = scoreSchema
export const submitScoreResponseSchema = v.object({
  ...scoreboardRowSchema.entries,
  ...playStatsSchema.entries,
})

export const getScoreParameterSchema = v.object({
  chart_md5: md5HashSchema,
  play_mode: playModeSchema,
  user_id: userIdSchema,
})
export const getScoreResponseSchema = v.object({
  ...scoreboardRowSchema.entries,
  ...playStatsSchema.entries,
})
