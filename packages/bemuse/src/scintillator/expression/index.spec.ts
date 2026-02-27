import { describe, expect, it } from 'vitest'

import { compileExpression } from './index.js'

describe('Scintillator Expression', function () {
  it('add', function () {
    const f = compileExpression('a+b')
    expect(f({ a: 1, b: 5 })).toStrictEqual(6)
  })
  it('mul', function () {
    const f = compileExpression('y*550-1')
    expect(f({ y: 10 })).toStrictEqual(5499)
  })
  it('literal', function () {
    const f = compileExpression('-1.25')
    expect(f({})).toStrictEqual(-1.25)
  })
})
