import readBlob from './read-blob'
import { describe, it, expect, vi } from 'vitest'

describe('readBlob', function () {
  it('rejects when cannot read blob', async () => {
    const blob = new Blob(['hello world'])
    vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(
      function () {
        this.onerror(new Error('...'))
      }
    )
    await expect(readBlob(blob).as('text')).rejects.toThrow()
    vi.restoreAllMocks()
  })

  it('resolves with correct type', async () => {
    const blob = new Blob(['hello world'])
    expect(await readBlob(blob).as('text')).toStrictEqual('hello world')
  })
})
