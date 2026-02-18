import { describe, it, expect } from 'vitest'
import { getServerIndexFileUrl } from './index.js'

describe('getServerIndexFileUrl', () => {
  it('adds index.json', () => {
    expect(getServerIndexFileUrl('https://server')).to.equal(
      'https://server/index.json'
    )
  })
  it('allows subdirectories', () => {
    expect(getServerIndexFileUrl('https://server/dir/')).to.equal(
      'https://server/dir/index.json'
    )
  })
  it('allows trailing slashes', () => {
    expect(getServerIndexFileUrl('https://server/dir')).to.equal(
      'https://server/dir/index.json'
    )
  })
  it('allows trailing /index.json', () => {
    expect(getServerIndexFileUrl('https://server/index.json')).to.equal(
      'https://server/index.json'
    )
  })
})
