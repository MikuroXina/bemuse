import debug from 'debug'

type Parser<O> = (input: string) => [rest: string, output: O | null]

const map =
  <A>(parser: Parser<A>) =>
  <B>(fn: (a: A) => B): Parser<B> =>
  (input) => {
    const [rest, a] = parser(input)
    if (a === null) {
      return [rest, null]
    }
    return [rest, fn(a)]
  }

const literal =
  <const K extends string>(lit: K): Parser<K> =>
  (input) => {
    if (input.startsWith(lit)) {
      return [input.slice(lit.length), lit]
    }
    return [input, null]
  }

const seq =
  <A, B>(first: Parser<A>, second: Parser<B>): Parser<[A, B]> =>
  (input) => {
    const [input2, a] = first(input)
    if (a === null) {
      return [input, null]
    }
    const [rest, b] = second(input2)
    if (b === null) {
      return [input, null]
    }
    return [rest, [a, b]]
  }
const seq3 = <A, B, C>(
  p1: Parser<A>,
  p2: Parser<B>,
  p3: Parser<C>
): Parser<[A, B, C]> => map(seq(p1, seq(p2, p3)))(([a, [b, c]]) => [a, b, c])
const seq4 = <A, B, C, D>(
  p1: Parser<A>,
  p2: Parser<B>,
  p3: Parser<C>,
  p4: Parser<D>
): Parser<[A, B, C, D]> =>
  map(seq(p1, seq(p2, seq(p3, p4))))(([a, [b, [c, d]]]) => [a, b, c, d])

const alt =
  <A, B>(first: Parser<A>, second: Parser<B>): Parser<A | B> =>
  (input) => {
    const [rest, a] = first(input)
    if (a !== null) {
      return [rest, a]
    }
    const [rest2, b] = second(input)
    if (b !== null) {
      return [rest2, b]
    }
    return [input, null]
  }
const alt3 = <A, B, C>(
  p1: Parser<A>,
  p2: Parser<B>,
  p3: Parser<C>
): Parser<A | B | C> => alt(p1, alt(p2, p3))
const alt4 = <A, B, C, D>(
  p1: Parser<A>,
  p2: Parser<B>,
  p3: Parser<C>,
  p4: Parser<D>
): Parser<A | B | C | D> => alt(p1, alt(p2, alt(p3, p4)))

const repeat =
  <A>(parser: Parser<A>): Parser<A[]> =>
  (input) => {
    const ret: A[] = []
    while (true) {
      const [nextInput, a] = parser(input)
      if (a === null) {
        return [input, ret]
      }
      ret.push(a)
      input = nextInput
    }
  }

const whitespaces0: Parser<string> = (input) => {
  const res = /^[ \t\n\r]*/.exec(input)
  if (res === null) {
    return [input, null]
  }
  return [input.slice(res[0].length), res[0]]
}

const number: Parser<number> = (input) => {
  const res =
    /^-?(?:0|(?:[1-9][0-9]*))(?:\.[0-9]+)?(?:[eE](?:[-+])?[0-9]+)?/.exec(input)
  if (res === null) {
    return [input, null]
  }
  return [input.slice(res[0].length), Number(res[0])]
}
const identifier: Parser<string> = (input) => {
  const res = /^[a-zA-Z]+[a-zA-Z0-9_]*/.exec(input)
  if (res === null) {
    return [input, null]
  }
  return [input.slice(res[0].length), res[0]]
}

const val: Parser<Expression> = (input) =>
  map(
    alt4(
      seq3(
        seq(literal('('), whitespaces0),
        expr,
        seq(whitespaces0, literal(')'))
      ),
      seq(literal('!'), val),
      number,
      identifier
    )
  )((got): Expression => {
    if (typeof got === 'number') {
      const literalExpr: Expression = () => got
      literalExpr.constant = true
      literalExpr.toString = () => got.toString()
      return literalExpr
    }

    const variableExpr: Expression = (env) => {
      if (typeof got === 'string') {
        if (!Object.hasOwn(env, got)) {
          return '0'
        }
        return env[got]
      }
      return got[0][0] === '(' ? got[1](env) : !got[1](env)
    }
    variableExpr.constant = false
    variableExpr.toString = (): string =>
      typeof got === 'string'
        ? got
        : got[0][0] === '('
          ? `(${got[1].toString()})`
          : `!${got[1].toString()}`
    return variableExpr
  })(input)

const mulDiv: Parser<Expression> = map(
  seq(
    repeat(
      seq4(
        val,
        whitespaces0,
        alt3(literal('*'), literal('/'), literal('%')),
        whitespaces0
      )
    ),
    val
  )
)(([lhs, rhs]): Expression => {
  if (lhs.length === 0) {
    return rhs
  }

  const mulDivExpr: Expression = (env) =>
    lhs.reduce(
      (prev, [curr, _, op]) =>
        op === '*'
          ? (curr(env) as number) * (prev as number)
          : op === '/'
            ? (curr(env) as number) / (prev as number)
            : (curr(env) as number) % (prev as number),
      rhs(env)
    )
  mulDivExpr.constant = false
  mulDivExpr.toString = () =>
    lhs.reduce(
      (prev: string, [curr, _, op]) => `${curr.toString()} ${op} ${prev}`,
      rhs.toString()
    )
  return mulDivExpr
})

const addSub: Parser<Expression> = map(
  seq(
    repeat(
      seq4(mulDiv, whitespaces0, alt(literal('+'), literal('-')), whitespaces0)
    ),
    mulDiv
  )
)(([lhs, rhs]): Expression => {
  if (lhs.length === 0) {
    return rhs
  }

  const addSubDyn: Expression = (env) =>
    lhs.reduce(
      (prev, [curr, _, op]) =>
        op === '+'
          ? (curr(env) as number) + (prev as number)
          : (curr(env) as number) - (prev as number),
      rhs(env)
    )
  addSubDyn.constant = false
  addSubDyn.toString = () =>
    lhs.reduce(
      (prev: string, [curr, _, op]) => `${curr.toString()} ${op} ${prev}`,
      rhs.toString()
    )
  return addSubDyn
})

const logicalAnd: Parser<Expression> = map(
  seq(repeat(seq4(addSub, whitespaces0, literal('&&'), whitespaces0)), addSub)
)(([lhs, rhs]): Expression => {
  if (lhs.length === 0) {
    return rhs
  }

  const logicalAndDyn: Expression = (env) =>
    lhs.reduce((prev, [curr]) => curr(env) && prev, rhs(env))
  logicalAndDyn.constant = false
  logicalAndDyn.toString = () =>
    lhs.reduce(
      (prev: string, [curr]) => `${curr.toString()} && ${prev}`,
      rhs.toString()
    )
  return logicalAndDyn
})

const logicalOr: Parser<Expression> = map(
  seq(
    repeat(seq4(logicalAnd, whitespaces0, literal('||'), whitespaces0)),
    logicalAnd
  )
)(([lhs, rhs]): Expression => {
  if (lhs.length === 0) {
    return rhs
  }

  const logicalOrDyn: Expression = (env) =>
    lhs.reduce((prev, [curr]) => prev || curr(env), rhs(env))
  logicalOrDyn.constant = false
  logicalOrDyn.toString = () =>
    lhs.reduce(
      (prev: string, [curr]) => `${curr.toString()} || ${prev}`,
      rhs.toString()
    )
  return logicalOrDyn
})

const expr: Parser<Expression> = logicalOr

const log = debug('scintillator:expression')

export interface Expression {
  constant: boolean;
  (env: Record<string, unknown>): unknown
  toString(): string
}

export function compileExpression(text: string): Expression {
  log('parsing %s', text)
  const [rest, program] = expr(text)
  log('parsed %s => %s, rest %s', text, program, rest)
  if (rest !== '' || program === null) {
    throw new Error(`invalid expression: ${text}`)
  }
  return program
}
