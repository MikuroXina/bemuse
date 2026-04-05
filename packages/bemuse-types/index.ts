import * as v from 'valibot'

export const chartInfoSchema = v.object({
  title: v.string(),
  artist: v.string(),
  genre: v.string(),
  subtitles: v.array(v.string()),
  subartists: v.array(v.string()),
  difficulty: v.number(),
  level: v.number(),
})
export type ChartInfo = v.InferOutput<typeof chartInfoSchema>

export const chartBpmSchema = v.object({
  init: v.number(),
  min: v.number(),
  median: v.number(),
  max: v.number(),
})
export type ChartBpm = v.InferOutput<typeof chartBpmSchema>

/**
 * BGA information embedded in chart files.
 * Not used by Bemuse — in Bemuse one song can contain one dedicated video file.
 */
export const chartBgaSchema = v.object({
  file: v.string(),
  offset: v.number(),
})
export type ChartBga = v.InferOutput<typeof chartBgaSchema>

export const chartKeysSchema = v.union([
  v.literal('5K'),
  v.literal('7K'),
  v.literal('10K'),
  v.literal('14K'),
  v.literal('empty'),
])
export type ChartKeys = v.InferOutput<typeof chartKeysSchema>

export const chartSchema = v.object({
  md5: v.pipe(v.string(), v.hash(['md5'])),
  info: chartInfoSchema,
  noteCount: v.number(),
  bpm: chartBpmSchema,
  duration: v.number(),
  scratch: v.boolean(),
  keys: chartKeysSchema,
  file: v.string(),
  bga: v.optional(chartBgaSchema),
})
export type Chart = v.InferOutput<typeof chartSchema>

/** The song metadata. Would find this in `song.json`. */
export const songMetadataSchema = v.object({
  title: v.string(),
  artist: v.string(),
  genre: v.string(),
  /** Representative BPM — used for sorting songs */
  bpm: v.number(),
  /** Artist’s canonical name */
  alias_of: v.optional(v.string()),
  /** Artist’s website */
  artist_url: v.optional(v.string()),
  /** BMS entry website (e.g. event venue page) */
  bms_url: v.optional(v.string()),
  /** Song website (e.g. soundcloud) */
  song_url: v.optional(v.string()),
  /** URL to the BGA on YouTube */
  youtube_url: v.optional(v.string()),
  /** Date (ISO formatted) */
  added: v.optional(v.string()),
  /** ReplayGain — format "-X.YY dB" */
  replaygain: v.string(),
  /** Video file from bmson */
  video_file: v.optional(v.string()),
  /** Relative or absolute URL to the webm video. Overrides `video_file` */
  video_url: v.optional(v.string()),
  /** When in the song to begin playing the video */
  video_offset: v.optional(v.union([v.number(), v.string()])),
  /** Eyecatch image override. This is displayed while loading a song */
  eyecatch_image_url: v.optional(v.string()),
  /** Back image override. This is displayed while in-game */
  back_image_url: v.optional(v.string()),
  /** ID for https://bmssearch.net/ */
  bmssearch_id: v.optional(v.union([v.number(), v.string()])),
  /** Relative or absolute URL to the README markdown file. */
  readme: v.optional(v.string()),
  /** Charts */
  charts: v.array(chartSchema),
  /** Warnings generating while indexing */
  warnings: v.optional(v.array(v.unknown())),
  /**
   * Mapping from filename to chart name.
   * Useful for when the BMS file itself does not contain subtitles.
   */
  chart_names: v.optional(v.record(v.string(), v.string())),
  /** Link to listen to long version of the song (e.g. soundcloud). */
  long_url: v.optional(v.string()),
  /** This song is initially released. */
  initial: v.optional(v.boolean()),
  /** The start offset of the preview into the song. */
  preview_start: v.optional(v.number()),
  /** The URL to the MP3 file. Default is `_bemuse_preview.mp3` */
  preview_url: v.optional(v.string(), '_bemuse_preview.mp3'),
  /** Whether this song is a tutorial. */
  tutorial: v.optional(v.number()),
  /** Whether this song is exclusive to Bemuse (not published elsewhere). */
  exclusive: v.optional(v.boolean()),
  /** The URL to the bemuse pack assets file. If undefined, defaults to `assets/metadata.json`. To use real files, must be explicitly set to `null`. */
  bemusepack_url: v.optional(v.nullable(v.string()), 'assets/metadata.json'),
})
export type SongMetadata = v.InferOutput<typeof songMetadataSchema>

export const songMetadataInCollectionSchema = v.object({
  ...songMetadataSchema.entries,
  /** Unique ID for the song */
  id: v.string(),
  /** Relative URL from `index.json` to song folder */
  path: v.string(),
})
export type SongMetadataInCollection = v.InferOutput<
  typeof songMetadataInCollectionSchema
>

/**
 * The Bemuse Music Server Index File. This is the contents of `index.json`.
 * @public
 */
export const musicServerIndexSchema = v.object({
  /**
   * Available songs.
   * @public
   */
  songs: v.array(songMetadataInCollectionSchema),
})
export type MusicServerIndex = v.InferOutput<typeof musicServerIndexSchema>
