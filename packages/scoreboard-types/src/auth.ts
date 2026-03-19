import * as v from 'valibot'

export const userIdSchema = v.pipe(v.string(), v.brand('UserId'))
export type UserId = v.InferOutput<typeof userIdSchema>

export const userInfoSchema = v.object({
  /** Identifier derived from Auth0.js. */
  id: userIdSchema,
  /** The display name of user. */
  name: v.string(),
  /** The registered date of user. */
  created_at: v.pipe(v.string(), v.isoTimestamp()),
  /** The user is frozen bout submitting new scores. */
  is_frozen: v.boolean(),
})
export type UserInfo = v.InferOutput<typeof userInfoSchema>

export const updateUserRequestSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
})
export const updateUserResponseSchema = userInfoSchema
