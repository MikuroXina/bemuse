import { promises } from 'node:fs'
import { join } from 'node:path'

import AudioConvertor from './audio.js'
import BemusePacker from './bemuse-packer.js'
import Directory from './directory.js'

export async function packIntoBemuse(path: string): Promise<void> {
  const stat = await promises.stat(path)
  if (!stat.isDirectory()) throw new Error('Not a directory: ' + path)

  const directory = new Directory(path)
  const packer = new BemusePacker()

  console.log('-> Loading audios')
  const audio = await directory.files('*.{mp3,wav,ogg}')

  console.log('-> Converting audio to ogg [better audio performance]')
  const oggc = new AudioConvertor('ogg', '-C', '3')
  oggc.force = true
  const oggs = await dotMap(audio, (file) => oggc.convert(file))
  packer.pack('ogg', oggs)

  console.log('-> Writing...')
  const out = join(path, 'assets')
  await promises.mkdir(out, { recursive: true })
  await packer.write(out)
}

async function dotMap<T, U>(
  array: readonly T[],
  map: (t: T) => Promise<U>
): Promise<U[]> {
  const results = await Promise.all(
    array.map(async (item) => {
      try {
        const result = await map(item)
        process.stdout.write('.')
        return [result]
      } catch (e) {
        process.stdout.write('x')
        process.stderr.write('[ERR] ' + (e as Error).stack)
        return []
      }
    })
  )
  process.stdout.write('\n')
  return results.flat()
}
