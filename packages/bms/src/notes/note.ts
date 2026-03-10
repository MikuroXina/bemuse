import * as v from 'valibot'

export const bmsNoteSchema = v.object({
  beat: v.number(),
  endBeat: v.optional(v.number()),
  column: v.optional(v.string()),
  keysound: v.string(),
  /**
   * [bmson] The number of seconds into the sound file to start playing
   */
  keysoundStart: v.optional(v.number()),
  /**
   * [bmson] The {Number} of seconds into the sound file to stop playing.
   * This may be `undefined` to indicate that the sound file should play until the end.
   */
  keysoundEnd: v.optional(v.number()),
})

/** A single note in a notechart. */
export type BMSNote = v.InferOutput<typeof bmsNoteSchema>
