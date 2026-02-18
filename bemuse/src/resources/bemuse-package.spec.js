import assert from 'assert'

import BemusePackageResources from './bemuse-package.js'
import { describe, it, expect, beforeEach } from 'vitest'

describe('BemusePackageResources', function () {
  describe('#file', function () {
    let resources

    beforeEach(function () {
      resources = new BemusePackageResources(
        new URL('./test-fixtures/a/', import.meta.url)
      )
    })

    it('returns a file', async () => {
      expect(await resources.file('do.mp3')).toBeTruthy()
    })

    it('rejects if file not found', async () => {
      await expect(resources.file('wow.mp3')).rejects.toThrow()
    })

    it('can be read', async () => {
      const file = await resources.file('mi.mp3')
      const buffer = await file.read()
      expect(buffer.byteLength).toStrictEqual(30093)
    })

    it('can obtain url', function () {
      return resources
        .file('mi.mp3')
        .then((file) => file.resolveUrl())
        .then((url) => {
          assert(typeof url === 'string')
        })
    })

    it('cannot read if not bemuse file', async () => {
      resources = new BemusePackageResources(
        new URL('./test-fixtures/b/', import.meta.url)
      )
      await expect(
        resources.file('do.mp3').then((file) => file.read())
      ).rejects.toThrow()
    })

    it('data is correct', function () {
      return resources
        .file('mi.mp3')
        .then((file) => file.read())
        .then((buffer) => new Uint8Array(buffer))
        .then((array) => {
          expect([array[0], array[1], array[2]]).to.deep.equal([
            0xff, 0xfb, 0x90,
          ])
        })
    })

    it('supports fallback', async function () {
      resources = new BemusePackageResources(
        new URL('./test-fixtures/a/', import.meta.url),
        {
          fallback: new URL('./test-fixtures/f/', import.meta.url),
          fallbackPattern: /\.txt$/,
        }
      )
      const file = await resources.file('meow.txt')
      const buffer = await file.read()
      const array = new Uint8Array(buffer)
      expect([array[0], array[1]]).to.deep.equal([0x68, 0x69])
    })
    it('supports fallback only with the pattern', async () => {
      resources = new BemusePackageResources(
        new URL('./test-fixtures/a/', import.meta.url),
        {
          fallback: new URL('./test-fixtures/f/', import.meta.url),
          fallbackPattern: /\.txt$/,
        }
      )
      await expect(resources.file('meow.dat')).rejects.toThrow()
    })
  })
})
