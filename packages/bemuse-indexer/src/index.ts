import {
  BMSChart,
  BMSNote,
  Compiler,
  Notes,
  Reader,
  SongInfo,
  Timing,
} from '@mikuroxina/bms'
import {
  hasScratch as bmsonHasScratch,
  keysForBmson,
  musicalScoreForBmson,
  songInfoForBmson,
} from '@mikuroxina/bmson'
import invariant from 'invariant'
import assign from 'object-assign'
import SparkMD5 from 'spark-md5'

import { getBmsBga } from './bms-bga.js'
import { getBmsonBga } from './bmson-bga.js'
import { getBpmInfo } from './bpm-info.js'
import { getDuration } from './duration.js'
import { getKeys } from './keys.js'
import { lcs } from './lcs.js'
import type {
  BGAInfo,
  IndexingInputFile,
  Keys,
  OutputChart,
  OutputFileInfo,
  OutputSongInfo,
  OutputSongInfoVideo,
} from './types.js'

export * from './types.js'

interface InputMeta {
  name: string
  md5?: string
}

interface FileIndexBasis {
  info: SongInfo
  notes: Notes
  timing: Timing
  scratch: boolean
  keys: Keys
  bga?: BGAInfo
}

interface ExtensionHandler {
  (source: ArrayBuffer, meta: InputMeta): Promise<FileIndexBasis>
}
interface ExtensionMap {
  [extname: string]: ExtensionHandler
}
const _extensions: ExtensionMap = {
  bms: async function (source, meta) {
    const options = Reader.getReaderOptionsFromFilename(meta.name)
    const str = await Reader.readAsync(source, options)
    const chart = Compiler.compile(str).chart
    const info = SongInfo.fromBMSChart(chart)
    const notes = Notes.fromBMSChart(chart)
    const timing = Timing.fromBMSChart(chart)
    return {
      info: info,
      notes: notes,
      timing: timing,
      scratch: hasScratch(chart),
      keys: getKeys(chart),
      bga: getBmsBga(chart, { timing }),
    }
  },
  bmson: async function (source) {
    const string = new TextDecoder('utf-8').decode(source)
    const object = JSON.parse(string)
    const info = songInfoForBmson(object)
    const ms = musicalScoreForBmson(object)
    const notes = ms.notes
    const timing = ms.timing
    const bga = getBmsonBga(object, { timing: timing })
    return {
      info: info,
      notes: notes,
      timing: timing,
      scratch: bmsonHasScratch(object),
      keys: keysForBmson(object),
      bga: bga,
    }
  },
}
export { _extensions as extensions }

export async function getFileInfo(
  data: ArrayBuffer,
  meta: InputMeta,
  options: { extensions?: ExtensionMap } = {}
): Promise<OutputFileInfo> {
  invariant(typeof meta.name === 'string', 'meta.name must be a string')

  const extensions = options.extensions ?? _extensions
  const nameExt = meta.name.split('.').pop()?.toLowerCase()
  const extension = (nameExt && extensions[nameExt]) || extensions['bms']

  const md5 = meta.md5 || SparkMD5.ArrayBuffer.hash(data)

  const basis = await extension(data, meta)
  invariant(basis.info, 'basis.info must be a BMS.SongInfo')
  invariant(basis.notes, 'basis.notes must be a BMS.Notes')
  invariant(basis.timing, 'basis.timing must be a BMS.Timing')
  invariant(
    typeof basis.scratch === 'boolean',
    'basis.scratch must be a boolean'
  )
  invariant(typeof basis.keys === 'string', 'basis.keys must be a string')
  const info = basis.info
  const notes = basis.notes
  const timing = basis.timing
  const count = notes.all().filter(noteIsPlayable).length
  return {
    md5: md5,
    info: info,
    noteCount: count,
    bpm: getBpmInfo(notes, timing),
    duration: getDuration(notes, timing),
    scratch: basis.scratch,
    keys: basis.keys,
    bga: basis.bga,
  }
}

export interface SongCache {
  get(md5: string): OutputFileInfo
  put(md5: string, info: OutputFileInfo): void
}

export async function getSongInfo(
  files: IndexingInputFile[],
  options?: {
    cache?: SongCache
    extra?: unknown
    onProgress?: (processed: number, len: number, name: string) => void
    onError?: (error: Error, name: string) => void
    getFileInfo?: typeof getFileInfo
  }
): Promise<OutputSongInfo> {
  options = options || {}
  const warnings: string[] = []
  const cache = options.cache || undefined
  const extra = options.extra || {}
  const report = options.onProgress || function reportFallback() {}
  const onError =
    options.onError ||
    function onErrorFallback(e, name) {
      console.error('Error while parsing ' + name, e)
    }
  let processed = 0
  const doGetFileInfo = options.getFileInfo || getFileInfo
  const results = await Promise.all(
    files.map(async (file): Promise<OutputChart[]> => {
      const name = file.name
      const fileData = file.data
      const md5Hash = SparkMD5.ArrayBuffer.hash(fileData)
      try {
        const cached = await Promise.resolve(cache && cache.get(md5Hash))
        if (cached) {
          return [{ ...cached, file: name }]
        } else {
          const meta = { name: name, md5: md5Hash }
          const info = await Promise.resolve(doGetFileInfo(fileData, meta))
          if (cache) cache.put(md5Hash, info)
          return [{ ...info, file: name }]
        }
      } catch (e) {
        onError(e as Error, name)
        warnings.push('Unable to parse ' + name + ': ' + e)
        return []
      } finally {
        processed += 1
        report(processed, files.length, name)
      }
    })
  )
  const charts = results.flat()
  if (charts.length === 0) {
    warnings.push('No usable charts found!')
  }
  const song: Partial<OutputSongInfo> = {
    title: common(charts, (item) => item.info.title),
    artist: common(charts, (item) => item.info.artist),
    genre: common(charts, (item) => item.info.genre),
    bpm: median(charts, (item) => item.bpm.median),
  }
  assign(song, getSongVideoFromCharts(charts))
  assign(song, extra)
  song.charts = charts
  song.warnings = warnings
  return song as OutputSongInfo
}

function getSongVideoFromCharts(charts: OutputFileInfo[]): OutputSongInfoVideo {
  const result: OutputSongInfoVideo = {}
  const chart = charts.find((chart) => chart.bga)
  if (chart) {
    result.video_file = chart.bga!.file
    result.video_offset = chart.bga!.offset
  }
  return result
}

export const _getSongVideoFromCharts = getSongVideoFromCharts

function noteIsPlayable(note: BMSNote) {
  return note.column !== undefined
}

function hasScratch(chart: BMSChart) {
  const objects = chart.objects.all()
  for (let i = 0; i < objects.length; i++) {
    const object = objects[i]
    let channel = +object.channel
    if (channel >= 50 && channel <= 69) channel -= 20
    if (channel === 16 || channel === 26) return true
  }
  return false
}

function common<T>(array: T[], f: (item: T) => string) {
  const longest = array.map(f).reduce(lcs, '')
  return String(longest || f(array[0])).trim()
}

function median<T>(array: T[], f: (item: T) => number) {
  const arr = array.map(f).toSorted((a, b) => a - b)
  return arr[Math.floor(arr.length / 2)]
}
