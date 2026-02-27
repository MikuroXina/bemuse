import { beforeEach, describe, expect, it } from 'vitest'

import * as DataStore from './data-store'
import * as Operations from './operations'

describe('Online DataStore', function () {
  describe('initial state', function () {
    describe('get', function () {
      it('should return initial operation state when not exist', function () {
        const item = DataStore.get(DataStore.initialState(), 'meow')
        expect(item).to.deep.equal(Operations.INITIAL_OPERATION_STATE)
      })
    })
    describe('has', function () {
      it('has should return false', function () {
        const has = DataStore.has(DataStore.initialState(), 'meow')
        expect(has).toBe(false)
      })
    })
  })

  describe('reducer', function () {
    describe('put', function () {
      it('should transition state of a record', function () {
        const action1 = DataStore.put('a', Operations.completed(1))
        const action2 = DataStore.put('b', Operations.completed(2))
        const state1 = DataStore.reduce(undefined, action1)
        const state = DataStore.reduce(state1, action2)
        expect(DataStore.get(state, 'a').value).to.equal(1)
        expect(DataStore.get(state, 'b').value).to.equal(2)
      })
    })
    describe('putMultiple', function () {
      it('should transition state of multiple records', function () {
        const action = DataStore.putMultiple({
          a: Operations.completed(1),
          b: Operations.completed(2),
        })
        const state = DataStore.reduce(undefined, action)
        expect(DataStore.get(state, 'a').value).to.equal(1)
        expect(DataStore.get(state, 'b').value).to.equal(2)
      })
    })
  })

  describe('with records', function () {
    let state
    beforeEach(function () {
      const action = DataStore.putMultiple({
        a: Operations.completed(1),
        b: Operations.completed(2),
        c: Operations.INITIAL_OPERATION_STATE,
        d: Operations.loading(),
      })
      state = DataStore.reduce(undefined, action)
    })
    describe('has', function () {
      it('has should return true if touched', function () {
        expect(DataStore.has(state, 'a')).toBe(true)
        expect(DataStore.has(state, 'b')).toBe(true)
        expect(DataStore.has(state, 'c')).toBe(true)
        expect(DataStore.has(state, 'd')).toBe(true)
      })
      it('has should return false if untouched', function () {
        expect(DataStore.has(state, 'e')).toBe(false)
      })
    })
    describe('clear', function () {
      it('should clear the store', function () {
        state = DataStore.reduce(state, DataStore.clear())
        expect(DataStore.has(state, 'a')).toBe(false)
      })
    })
  })
})
