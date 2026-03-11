import { assert, describe, expect, it } from 'vitest'

import URLResource from './url'

describe('URLResource', function () {
  it('can download a resource from an arbitrary URL', async function () {
    const resource = new URLResource(
      new URL('./test-fixtures/f/meow.txt', import.meta.url)
    )
    const buffer = await resource.read()
    const array = new Uint8Array(buffer)
    expect([array[0], array[1]]).to.deep.equal([0x68, 0x69])
  })
  it('can retrieve back the URL', async function () {
    const resource = new URLResource(
      new URL('./test-fixtures/f/meow.txt', import.meta.url)
    )
    const url = await resource.resolveUrl()
    assert(/\/meow\.txt$/.test(url))
  })
  it('has a name, which is only the file name without the path', function () {
    const resource = new URLResource(
      new URL('./test-fixtures/f/meow.txt', import.meta.url)
    )
    assert(resource.name === 'meow.txt')
  })
})
