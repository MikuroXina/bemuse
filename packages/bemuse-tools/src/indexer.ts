import fs from 'node:fs'
import { basename, dirname, join } from 'node:path'

import {
  getSongInfo,
  IndexingInputFile,
  OutputFileInfo,
  OutputSongInfo,
  type SongCache,
} from '@mikuroxina/bemuse-indexer'
import {
  Chart,
  ChartKeys,
  SongMetadataInCollection,
} from '@mikuroxina/bemuse-types'
import chalk, { ChalkInstance } from 'chalk'
import { glob } from 'glob'
import yaml from 'js-yaml'
import { sortBy } from 'lodash-es'

const { readFile, writeFile, stat: fileStat } = fs.promises

class Cache implements SongCache {
  constructor(private readonly path: string) {
    this.#stream = fs.createWriteStream(this.path, {
      encoding: 'utf-8',
      flags: 'a',
    })
  }

  #stream: fs.WriteStream

  private get data(): Record<string, OutputFileInfo> {
    const out: Record<string, OutputFileInfo> = {}
    let text
    try {
      text = fs.readFileSync(this.path, 'utf-8')
    } catch {
      return out
    }
    text.split(/\n/).forEach(function (line) {
      if (line.length < 34) return
      const md5 = line.slice(0, 32)
      const payload = JSON.parse(line.slice(33))
      out[md5] = payload
    })
    return out
  }

  get(key: string): OutputFileInfo {
    return this.data[key]
  }

  put(key: string, value: OutputFileInfo): unknown {
    if (key.length !== 32) throw new Error('Keys should be 32 chars only')
    this.data[key] = value
    this.#stream.write(key + ' ' + JSON.stringify(value) + '\n')
    return value
  }
}

export interface IndexOptions {
  recursive: boolean
}

export async function index(
  path: string,
  { recursive }: IndexOptions
): Promise<void> {
  const stat = await fileStat(path)
  if (!stat.isDirectory()) throw new Error('Not a directory: ' + path)

  const cache = new Cache(join(path, 'index.cache'))

  console.log('-> Scanning files...')
  const dirs = new Map<string, string[]>()
  const pattern = (recursive ? '**/' : '') + '*/*.{bms,bme,bml,bmson}'
  for (const name of await glob(pattern, { cwd: path })) {
    const bmsPath = join(path, name)
    put(dirs, dirname(bmsPath), () => []).push(basename(bmsPath))
  }

  const songs: SongMetadataInCollection[] = []
  const maxDirLength = Array.from(dirs.keys())
    .map(({ length }) => length)
    .reduce((prev, curr) => Math.max(prev, curr), 0)
  for (const [dir, files] of dirs) {
    const filesToParse: IndexingInputFile[] = []

    for (const file of files) {
      const buf = await readFile(join(dir, file))
      if (buf.length > 1048576) {
        console.error(chalk.red('BMS file is too long:'), join(dir, file))
        continue
      }
      filesToParse.push({ name: file, data: buf.buffer })
    }

    const extra = await getExtra(dir)
    const song: Partial<SongMetadataInCollection> = await getSongInfo(
      filesToParse,
      { cache, extra }
    )
    song.id = dir
    song.path = dir

    const levels = sortBy(song.charts, (chart: Chart) => chart.info.level).map(
      (chart: Chart) => {
        const colors: Record<ChartKeys, ChalkInstance> = {
          '5K': chalk.gray,
          '7K': chalk.green,
          '10K': chalk.magenta,
          '14K': chalk.red,
          empty: chalk.inverse,
        }
        const ch = colors[chart.keys] ?? chalk.inverse
        return ch(chart.info.level)
      }
    )
    console.log(
      chalk.dim(dir.padEnd(maxDirLength)),
      chalk.yellow(`${Math.round(song.bpm ?? 120)}bpm`.padStart(7)),
      chalk.cyan('[' + song.genre + ']'),
      song.artist + '-' + song.title,
      levels.join(' '),
      song.readme ? '' : chalk.red('[no-meta]')
    )
    songs.push(song as SongMetadataInCollection)
  }

  const collection = {
    songs: songs,
  }

  await writeFile(join(path, 'index.json'), JSON.stringify(collection))
}

type Extra =
  | {
      readme: null
    }
  | ({
      readme: string
    } & Partial<OutputSongInfo>)

async function getExtra(dir: string): Promise<Extra> {
  let readme: string | null
  let extra: Extra = { readme: null }
  try {
    readme = await readFile(join(dir, 'README.md'), 'utf-8')
    extra = { readme: 'README.md' }
  } catch {
    readme = null
  }
  if (readme !== null) {
    try {
      const meta = yaml.load(readme.slice(0, readme.indexOf('---', 3)))
      extra = Object.assign({}, meta, extra)
    } catch (e) {
      console.error(chalk.red('Unable to read metadata:'), '' + e)
    }
  }
  return extra
}

function put<K, V>(map: Map<K, V>, key: K, f: (k: K) => V): V {
  if (map.has(key)) {
    return map.get(key)!
  } else {
    const object = f(key)
    map.set(key, object)
    return object
  }
}
