import assert from 'assert'
import { beforeEach, describe, expect, it } from 'vitest'

import BemusePackageResources from './bemuse-package.js'

describe('#file', function () {
  let resources: BemusePackageResources

  beforeEach(function () {
    const basePath = new URL('./test-fixtures/a/', import.meta.url).href + '/'
    console.dir({ basePath })
    resources = new BemusePackageResources(basePath)
  })

  it('returns a file', async () => {
    try {
      expect(await resources.file('do.mp3')).toBeTruthy()
    } catch (err) {
      console.dir(err)
      throw err
    }
  })

  it('rejects if file not found', async () => {
    await expect(resources.file('wow.mp3')).rejects.toThrow()
  })

  it('can be read', async () => {
    const file = await resources.file('mi.mp3')
    const buffer = await file.read()
    expect(buffer.byteLength).toStrictEqual(30093)
  })

  it('can obtain url', async function () {
    const file = await resources.file('mi.mp3')
    const url = await file.resolveUrl()
    assert(typeof url === 'string')
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
        expect([array[0], array[1], array[2]]).to.deep.equal([0xff, 0xfb, 0x90])
      })
  })

  it('supports fallback', async function () {
    resources = new BemusePackageResources(
      new URL('./test-fixtures/a/', import.meta.url).href + '/',
      {
        fallback: new URL('./test-fixtures/f/', import.meta.url).href + '/',
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
        fallback: new URL('./test-fixtures/f/', import.meta.url).href + '/',
        fallbackPattern: /\.txt$/,
      }
    )
    await expect(resources.file('meow.dat')).rejects.toThrow()
  })
})
