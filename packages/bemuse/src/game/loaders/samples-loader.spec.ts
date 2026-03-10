import type { KeysoundCache } from '@bemuse/keysound-cache/index.js'
import type { IResource } from '@bemuse/resources/types.js'
import type SamplingMaster from '@bemuse/sampling-master/index.js'
import type { Sample } from '@bemuse/sampling-master/index.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Assets } from './load-spec.js'
import SamplesLoader from './samples-loader.js'

describe('SamplesLoader', function () {
  const assets = { file: () => {} } as unknown as Assets
  const master = {
    decode: () => {},
    sample: () => {},
  } as unknown as SamplingMaster
  const keysoundCache = {
    isCached: () => false,
    cache: () => {},
    get: () => {},
  } as unknown as KeysoundCache
  let loader: SamplesLoader

  beforeEach(function () {
    vi.resetAllMocks()
    loader = new SamplesLoader(assets, master, { keysoundCache })
  })

  describe('#loadFiles', function () {
    it('should not include undecodable audio', async () => {
      vi.spyOn(assets, 'file').mockImplementation((arg) => {
        if (arg === 'a.wav') {
          return Promise.resolve({
            read: () => Promise.resolve(new TextEncoder().encode('ok1')),
          } as unknown as IResource)
        }
        return Promise.reject(new Error('cannot decode'))
      })
      const mock = vi.spyOn(master, 'decode').mockImplementation((arg) => {
        if ('byteLength' in arg && new TextDecoder().decode(arg) === 'ok1') {
          return Promise.reject(new Error('..'))
        }
        throw new Error('unreachable')
      })
      expect(await loader.loadFiles(['a.wav'])).toStrictEqual({})
      expect(mock).toHaveBeenCalledWith(new TextEncoder().encode('ok1'))
    })

    it('should cache', async () => {
      vi.spyOn(assets, 'file').mockImplementation((arg) => {
        if (arg === 'a.wav') {
          return Promise.resolve({
            read: () => Promise.resolve(new TextEncoder().encode('ok1')),
          } as unknown as IResource)
        }
        return Promise.reject(new Error('invalid filename'))
      })
      const audioBuf = new AudioBuffer({ length: 2, sampleRate: 3000 })
      const decodeMock = vi
        .spyOn(master, 'decode')
        .mockImplementation((arg) => {
          if ('byteLength' in arg && new TextDecoder().decode(arg) === 'ok1') {
            return Promise.resolve(audioBuf)
          }
          throw new Error('unreachable')
        })
      const sampleMock = vi
        .spyOn(master, 'sample')
        .mockImplementation((arg) => {
          if (arg === audioBuf) {
            return Promise.resolve('ok3' as unknown as Sample)
          }
          throw new Error('unreachable')
        })
      const cacheMock = vi.spyOn(keysoundCache, 'cache')

      await loader.loadFiles(['a.wav'])

      expect(cacheMock).toHaveBeenCalledOnce()
      expect(cacheMock).toHaveBeenCalledWith('a.wav', audioBuf)
      expect(decodeMock).toHaveBeenCalledWith(new TextEncoder().encode('ok1'))
      expect(sampleMock).toHaveBeenCalledWith(audioBuf)
    })

    it('should use cache', async () => {
      vi.spyOn(assets, 'file').mockRejectedValue(new Error('unexpected call'))
      vi.spyOn(keysoundCache, 'isCached').mockImplementation(
        (name) => name === 'name.wav'
      )
      const audioBuf = new AudioBuffer({ length: 2, sampleRate: 3000 })
      vi.spyOn(keysoundCache, 'get').mockImplementation((name) => {
        if (name === 'name.wav') {
          return audioBuf
        }
        throw new Error('expected name.wav')
      })
      const sampleMock = vi
        .spyOn(master, 'sample')
        .mockImplementation((arg) => {
          if (arg === audioBuf) {
            return Promise.resolve('sample' as unknown as Sample)
          }
          throw new Error('unreachable')
        })
      expect(await loader.loadFiles(['name.wav'])).toStrictEqual({
        'name.wav': 'sample',
      })
      expect(sampleMock).toHaveBeenCalledWith(audioBuf)
    })

    it('should try mp3', async () => {
      vi.spyOn(assets, 'file').mockImplementation((arg) => {
        if (arg === 'a.mp3') {
          return Promise.resolve({
            read: () => Promise.resolve(new TextEncoder().encode('ok1')),
          } as unknown as IResource)
        }
        return Promise.reject(new Error('invalid filename'))
      })
      const audioBuf = new AudioBuffer({ length: 2, sampleRate: 3000 })
      const decodeMock = vi
        .spyOn(master, 'decode')
        .mockImplementation((arg) => {
          if ('byteLength' in arg && new TextDecoder().decode(arg) === 'ok1') {
            return Promise.resolve(audioBuf)
          }
          throw new Error('unreachable')
        })
      const sampleMock = vi
        .spyOn(master, 'sample')
        .mockImplementation((arg) => {
          if (arg === audioBuf) {
            return Promise.resolve('ok3' as unknown as Sample)
          }
          throw new Error('unreachable')
        })
      expect(await loader.loadFiles(['a.wav'])).toStrictEqual({
        'a.wav': 'ok3',
      })
      expect(decodeMock).toHaveBeenCalledWith(new TextEncoder().encode('ok1'))
      expect(sampleMock).toHaveBeenCalledWith(audioBuf)
    })

    it('should not include failed matches', async () => {
      vi.spyOn(assets, 'file').mockRejectedValue(new Error('i give up'))
      expect(await loader.loadFiles(['a.wav'])).toStrictEqual({})
    })
  })
})
