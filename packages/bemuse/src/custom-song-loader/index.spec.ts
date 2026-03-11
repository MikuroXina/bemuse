import type { Song } from '@bemuse/collection-model/types.js'
import type {
  ICustomSongResources,
  IResource,
} from '@bemuse/resources/types.js'
import { beforeAll, describe, expect, it } from 'vitest'

import { loadSongFromResources } from './index.js'

describe('SongLoader', function () {
  function buffer(text: string) {
    return Promise.resolve(new TextEncoder().encode(text).buffer)
  }

  function createResources(
    files: Record<string, IResource>
  ): ICustomSongResources {
    return {
      initialLog: [],
      fileList: Promise.resolve(Object.keys(files)),
      file(name: string) {
        return Promise.resolve(files[name])
      },
    }
  }

  describe('with BMS files', function () {
    const resources = createResources({
      '01.bme': {
        name: '01.bme',
        resolveUrl: () => Promise.resolve(''),
        read() {
          return buffer('#TITLE meow [NORMAL]\n#BPM 90\n#00111:01')
        },
      },
      '02.bms': {
        name: '02.bms',
        resolveUrl: () => Promise.resolve(''),
        read() {
          return buffer('#TITLE meow [HYPER]\n#BPM 90\n#00111:01')
        },
      },
      '03.bml': {
        name: '03.bml',
        resolveUrl: () => Promise.resolve(''),
        read() {
          return buffer('#TITLE meow [ANOTHER]\n#BPM 100\n#00111:01')
        },
      },
    })
    let song: Song
    beforeAll(async function () {
      const options = { onMessage: (msg: string) => console.log(msg) }
      const x = await loadSongFromResources(resources, options)
      song = x
    })
    it('should have correct title', function () {
      expect(song.title).to.equal('meow')
    })
    it('should have correct number of charts', function () {
      expect(song.charts).to.have.length(3)
    })
    it('should have resources key pointing to the resources', function () {
      expect(song.resources).to.equal(resources)
    })
  })

  describe('with bmson files', function () {
    const resources = createResources({
      '01.bmson': {
        name: '01.bmson',
        resolveUrl: () => Promise.resolve(''),
        read() {
          return buffer('{"info":{"title":"meow","initBPM":90}}')
        },
      },
    })
    let song: Song
    beforeAll(async function () {
      const x = await loadSongFromResources(resources)
      song = x
    })
    it('should have correct title', function () {
      expect(song.title).to.equal('meow')
    })
    it('should have correct number of charts', function () {
      expect(song.charts).to.have.length(1)
    })
  })
})
