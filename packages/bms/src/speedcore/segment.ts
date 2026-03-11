import * as v from 'valibot'

export const speedSegmentSchema = v.object({
  t: v.number(),
  x: v.number(),
  /** the amount of change in x per t */
  dx: v.number(),
  /** whether or not the segment includes the t */
  inclusive: v.boolean(),
})

export type SpeedSegment = v.InferOutput<typeof speedSegmentSchema>
