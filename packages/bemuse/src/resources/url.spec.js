import assert from 'assert'
import { describe, expect, it } from 'vitest'

import URLResource from './url'

describe('URLResource', function () {
  it('can download a resource from an arbitrary URL', function () {
    const resource = new URLResource(
      new URL('./test-fixtures/f/meow.txt', import.meta.url)
    )
    return resource
      .read()
      .then((buffer) => new Uint8Array(buffer))
      .then((array) => {
        expect([array[0], array[1]]).to.deep.equal([0x68, 0x69])
      })
  })
  it('can retrieve back the URL', function () {
    const resource = new URLResource(
      new URL('./test-fixtures/f/meow.txt', import.meta.url)
    )
    return resource.resolveUrl().then((url) => {
      assert(/\/meow\.txt$/.test(url))
    })
  })
  it('has a name, which is only the file name without the path', function () {
    const resource = new URLResource(
      new URL('./test-fixtures/f/meow.txt', import.meta.url)
    )
    assert(resource.name === 'meow.txt')
  })
})
