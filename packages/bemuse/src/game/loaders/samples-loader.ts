import defaultKeysoundCache, {
  type KeysoundCache,
} from '@bemuse/keysound-cache'
import type Progress from '@bemuse/progress'
import { EXTRA_FORMATTER } from '@bemuse/progress/formatters'
import * as ProgressUtils from '@bemuse/progress/utils'
import type { IResource } from '@bemuse/resources/types'
import type SamplingMaster from '@bemuse/sampling-master'
import type { Sample } from '@bemuse/sampling-master'
import pMap from 'p-map'

import type { Assets } from './load-spec'

export class SamplesLoader {
  private readonly _keysoundCache: KeysoundCache

  constructor(
    private readonly assets: Assets,
    private readonly master: SamplingMaster,
    { keysoundCache = defaultKeysoundCache } = {}
  ) {
    this._keysoundCache = keysoundCache
  }

  loadFiles(
    files: readonly string[],
    loadProgress?: Progress,
    decodeProgress?: Progress
  ): Promise<Record<string, Sample>> {
    const onLoad = ProgressUtils.fixed(files.length, loadProgress)
    const onDecode = ProgressUtils.fixed(files.length, decodeProgress)
    const load = (name: string) =>
      new Promise<[string, Sample] | null>((resolve) => {
        requestAnimationFrame(() => {
          resolve(this._loadSample(name, onLoad, onDecode))
        })
      })
    if (decodeProgress) decodeProgress.formatter = EXTRA_FORMATTER
    return pMap(files, load, { concurrency: 64 }).then((arr) =>
      Object.fromEntries(arr.filter((value) => !!value))
    )
  }

  async _loadSample(
    name: string,
    onLoad: (name: string) => void,
    onDecode: (name: string) => void
  ): Promise<[string, Sample] | null> {
    const audioBufferPromise = (async () => {
      const cache = this._keysoundCache.get(name)
      if (cache != undefined) {
        onLoad(name)
        onDecode(name)
        return cache
      }

      const file = await this._getFile(name)
      const buffer = await file.read()
      onLoad(name)
      const audioBuffer = await this._decode(buffer)
      this._keysoundCache.cache(name, audioBuffer)
      onDecode(name)
      return audioBuffer
    })()
    try {
      const audioBuffer = await audioBufferPromise

      const sample = await this.master.sample(audioBuffer)
      return [name, sample]
    } catch (e) {
      console.error('Unable to load keysound: ' + name, e)
      return null
    }
  }

  _decode(buffer: ArrayBuffer): Promise<AudioBuffer> {
    return this.master.decode(buffer)
  }

  _getFile(name: string): Promise<IResource> {
    name = name.replace(/\\/g, '/')
    return Promise.resolve(this.assets.file(name.replace(/\.\w+$/, '.ogg')))
      .catch(() => this.assets.file(name.replace(/\.\w+$/, '.m4a')))
      .catch(() => this.assets.file(name.replace(/\.\w+$/, '.flac')))
      .catch(() => this.assets.file(name.replace(/\.\w+$/, '.mp3')))
      .catch(() => this.assets.file(name))
  }
}

export default SamplesLoader
