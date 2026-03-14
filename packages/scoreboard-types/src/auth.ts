import * as v from 'valibot'

export const userIdSchema = v.pipe(v.string(), v.brand('UserId'))
export type UserId = v.InferOutput<typeof userIdSchema>

export const userInfoSchema = v.object({
  /** Identifier derived from Auth0.js. */
  id: userIdSchema,
  /** The display name of user. */
  name: v.string(),
  /** The registered date of user. */
  created_at: v.pipe(v.string(), v.isoDateTime()),
  /** The user is frozen bout submitting new scores. */
  is_frozen: v.boolean(),
})
export type UserInfo = v.InferOutput<typeof userInfoSchema>

export const signUpParameterSchema = v.object({
  state: v.string(),
})

export const signUpCallbackParameterSchema = v.object({
  /** OAuth 2.0 authorization code. */
  code: v.string(),
  state: v.string(),
})
export const signUpCallbackResponseSchema = v.object({
  user_info: userInfoSchema,
  /** A Bearer token which you can use on other APIs of this service to authorize. */
  access_token: v.string(),
  /** A Bearer token which you can pass to `/refresh` when the access token has expired. */
  refresh_token: v.string(),
})

export const refreshResponseSchema = v.object({
  /** A Bearer token which you can use on other APIs of this service to authorize. */
  access_token: v.string(),
  /** A Bearer token which you can pass to `/refresh` when the access token has expired. */
  refresh_token: v.string(),
})

export const updateUserRequestSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
})
export const updateUserResponseSchema = userInfoSchema
