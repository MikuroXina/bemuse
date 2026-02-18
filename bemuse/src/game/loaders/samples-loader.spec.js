import SamplesLoader from './samples-loader.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('SamplesLoader', function () {
  const assets = { file: () => {} }
  const master = { decode: () => {}, sample: () => {} }
  const keysoundCache = {
    isCached: () => false,
    cache: () => {},
    get: () => {},
  }
  let loader

  beforeEach(function () {
    vi.resetAllMocks()
    loader = new SamplesLoader(assets, master, { keysoundCache })
  })

  describe('#loadFiles', function () {
    it('should not include undecodable audio', async () => {
      vi.spyOn(assets, 'file').mockImplementation((arg) => {
        if (arg === 'a.wav') {
          return Promise.resolve({
            read: () => Promise.resolve('ok1'),
          })
        }
        return Promise.reject(new Error('cannot decode'))
      })
      const mock = vi.spyOn(master, 'decode').mockImplementation((arg) => {
        if (arg === 'ok1') {
          return Promise.reject(new Error('..'))
        }
      })
      expect(await loader.loadFiles(['a.wav'])).toStrictEqual({})
      expect(mock).toHaveBeenCalledWith('ok1')
    })

    it('should cache', async () => {
      vi.spyOn(assets, 'file').mockImplementation((arg) => {
        if (arg === 'a.wav') {
          return Promise.resolve({
            read: () => Promise.resolve('ok1'),
          })
        }
        return Promise.reject(new Error('invalid filename'))
      })
      const decodeMock = vi
        .spyOn(master, 'decode')
        .mockImplementation((arg) => {
          if (arg === 'ok1') {
            return Promise.resolve('ok2')
          }
        })
      const sampleMock = vi
        .spyOn(master, 'sample')
        .mockImplementation((arg) => {
          if (arg === 'ok2') {
            return Promise.resolve('ok3')
          }
        })
      const cacheMock = vi.spyOn(keysoundCache, 'cache')

      await loader.loadFiles(['a.wav'])

      expect(cacheMock).toHaveBeenCalledOnce()
      expect(cacheMock).toHaveBeenCalledWith('a.wav', 'ok2')
      expect(decodeMock).toHaveBeenCalledWith('ok1')
      expect(sampleMock).toHaveBeenCalledWith('ok2')
    })

    it('should use cache', async () => {
      vi.spyOn(assets, 'file').mockRejectedValue(new Error('unexpected call'))
      vi.spyOn(keysoundCache, 'isCached').mockImplementation(
        (name) => name === 'name.wav'
      )
      vi.spyOn(keysoundCache, 'get').mockImplementation((name) => {
        if (name === 'name.wav') {
          return 'buffer'
        }
        throw new Error('expected name.wav')
      })
      const sampleMock = vi
        .spyOn(master, 'sample')
        .mockImplementation((arg) => {
          if (arg === 'buffer') {
            return Promise.resolve('sample')
          }
        })
      expect(await loader.loadFiles(['name.wav'])).toStrictEqual({
        'name.wav': 'sample',
      })
      expect(sampleMock).toHaveBeenCalledWith('buffer')
    })

    it('should try mp3', async () => {
      vi.spyOn(assets, 'file').mockImplementation((arg) => {
        if (arg === 'a.mp3') {
          return Promise.resolve({
            read: () => Promise.resolve('ok1'),
          })
        }
        return Promise.reject(new Error('invalid filename'))
      })
      const decodeMock = vi
        .spyOn(master, 'decode')
        .mockImplementation((arg) => {
          if (arg === 'ok1') {
            return Promise.resolve('ok2')
          }
        })
      const sampleMock = vi
        .spyOn(master, 'sample')
        .mockImplementation((arg) => {
          if (arg === 'ok2') {
            return Promise.resolve('ok3')
          }
        })
      expect(await loader.loadFiles(['a.wav'])).toStrictEqual({
        'a.wav': 'ok3',
      })
      expect(decodeMock).toHaveBeenCalledWith('ok1')
      expect(sampleMock).toHaveBeenCalledWith('ok2')
    })

    it('should not include failed matches', async () => {
      vi.spyOn(assets, 'file').mockRejectedValue(new Error('i give up'))
      expect(await loader.loadFiles(['a.wav'])).toStrictEqual({})
    })
  })
})
