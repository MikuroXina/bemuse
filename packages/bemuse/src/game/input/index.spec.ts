import { beforeEach, describe, expect, it, vi } from 'vitest'

import GameInput, { type IGameInputPlugin } from './index.js'

describe('GameInput', function () {
  let input: GameInput
  const plugin: IGameInputPlugin = {
    name: 'mock',
    get: () => ({}),
  }

  beforeEach(function () {
    vi.resetAllMocks()
    input = new GameInput()
    input.use(plugin)
  })

  it('should return control with default value of 0', function () {
    expect(input.get('wow').value).to.equal(0)
  })

  describe('Control#value', function () {
    it('should return control with correct value', function () {
      vi.spyOn(plugin, 'get').mockReturnValue({ wow: -1 })
      input.update()

      expect(input.get('wow').value).to.equal(-1)
    })
  })

  describe('Control#changed', function () {
    it('should return changed state between last update', function () {
      input.update()
      expect(input.get('wow').changed).to.equal(false)

      vi.spyOn(plugin, 'get').mockReturnValue({ wow: 0 })
      input.update()

      expect(input.get('wow').changed).to.equal(false)

      vi.spyOn(plugin, 'get').mockReturnValue({ wow: -1 })
      input.update()

      expect(input.get('wow').changed).to.equal(true)

      vi.spyOn(plugin, 'get').mockReturnValue({ wow: 1 })
      input.update()

      expect(input.get('wow').changed).to.equal(true)

      vi.spyOn(plugin, 'get').mockReturnValue({ wow: 1 })
      input.update()

      expect(input.get('wow').changed).to.equal(false)

      input.update()

      expect(input.get('wow').changed).to.equal(false)

      vi.spyOn(plugin, 'get').mockReturnValue({ wow: 0 })
      input.update()
      expect(input.get('wow').changed).to.equal(true)
    })
  })
})
