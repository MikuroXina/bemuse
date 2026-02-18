import { describe, it, expect, vi } from 'vitest'
import Observable from './observable.js'

describe('Observable', function () {
  describe('stateless mode', function () {
    it('should call watchers', function () {
      const s1 = vi.fn()
      const s2 = vi.fn()
      const o = new Observable()
      const u = o.watch(s1)

      expect(s1).not.toHaveBeenCalled()
      o.notify('1')
      expect(s1).toHaveBeenCalledWith('1')
      o.watch(s2)
      expect(s2).not.toHaveBeenCalled()
      o.notify('2')
      expect(s1).toHaveBeenCalledWith('2')
      expect(s2).toHaveBeenCalledWith('2')
      u()
      o.notify('3')
      expect(s1).not.toHaveBeenCalledWith('3')
      expect(s2).toHaveBeenCalledWith('3')
    })
  })

  describe('stateful mode', function () {
    it('should have value', function () {
      const o = new Observable('0')
      expect(o.value).to.equal('0')
    })

    it('should call watchers', function () {
      const s1 = vi.fn()
      const s2 = vi.fn()
      const o = new Observable('0')
      const u = o.watch(s1)
      expect(s1).toHaveBeenCalledWith('0')
      o.value = '1'
      expect(s1).toHaveBeenCalledWith('1')
      o.watch(s2)
      expect(s2).toHaveBeenCalledWith('1')
      o.value = '2'
      expect(s1).toHaveBeenCalledWith('2')
      expect(s2).toHaveBeenCalledWith('2')
      u()
      o.value = '3'
      expect(s1).not.toHaveBeenCalledWith('3')
      expect(s2).toHaveBeenCalledWith('3')
    })
  })
})
