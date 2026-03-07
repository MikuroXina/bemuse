import { beforeEach, describe, expect, it } from 'vitest'

import Payload from '../src/payload'

function buffer(text) {
  return new TextEncoder().encode(text)
}

describe('Payload', function () {
  let payload

  beforeEach(() => {
    payload = new Payload()
  })

  describe('with 2 buffers added: "hello" and ", "', function () {
    beforeEach(() => {
      payload.add(buffer('hello'))
      payload.add(buffer(', '))
    })

    it('should have size of 7', () => expect(payload.size).to.equal(7))

    it('should have correct hash', () =>
      expect(payload.hash).to.equal('0b76896c047e4a9070813cfe8bdd83f5'))

    it('should return slicing for new buffers', () =>
      expect(payload.add(buffer('world!'))).to.deep.equal([7, 13]))
  })
})
