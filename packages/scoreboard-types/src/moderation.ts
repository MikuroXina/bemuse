import * as v from 'valibot'

import { userIdSchema, userInfoSchema } from './auth'
import { scoreboardEntrySchema } from './scoreboard'

export const listUsersParameterSchema = v.object({
  since: v.optional(v.pipe(v.string(), v.isoTimestamp())),
  until: v.optional(v.pipe(v.string(), v.isoTimestamp())),
  name: v.optional(v.string()),
})
export const listUsersResponseSchema = v.pipe(
  v.array(userInfoSchema),
  v.maxLength(100)
)

export const inspectUserParameterSchema = v.object({
  user_id: userIdSchema,
})
export const inspectUserResponseSchema = v.object({
  info: userInfoSchema,
  plays: v.array(scoreboardEntrySchema),
})

export const freezeParameterSchema = v.object({
  user_id: userIdSchema,
})
export const unfreezeParameterSchema = v.object({
  user_id: userIdSchema,
})
