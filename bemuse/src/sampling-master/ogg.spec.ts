import { describe, it, expect } from 'vitest'
import download from '@bemuse/utils/download.js'
import { decodeOGG } from './ogg.js'

describe('ogg decoder', () => {
  it('can decode ogg file', async () => {
    const arrayBuffer = await download(
      new URL('./fixtures/guitar-slice-007.ogg', import.meta.url)
    ).as('arraybuffer')
    const decoded = await decodeOGG(new AudioContext(), arrayBuffer)
    expect(decoded.duration).to.closeTo(0.04510204081632653, 0.001)
  })
})
