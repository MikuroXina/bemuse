import download from '@bemuse/utils/download.js'
import { describe, expect, it, vi } from 'vitest'

describe('download', function () {
  const options = {
    getRetryDelay: () => 0,
  }

  it('resolves with correct type', async () => {
    expect(
      await download(
        new URL('./test-fixtures/download/hello.txt', import.meta.url)
      ).as('text')
    ).toMatch(/hello world/)
  })

  it('rejects for 404', async () => {
    await expect(download('/nonexistant').as('blob')).rejects.toThrow()
  })

  it('rejects for bad url', async () => {
    await expect(
      download('file:///nonexistant', options).as('blob')
    ).rejects.toThrow()
  })

  it('rejects for XHR error', async () => {
    vi.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(function () {
      this.onerror(new Error('...'))
    })
    const url = new URL('./test-fixtures/download/hello.txt', import.meta.url)

    await expect(download(url, options).as('blob')).rejects.toThrow(
      new Error(`Unable to download ${url}`)
    )

    vi.restoreAllMocks()
  })
})
