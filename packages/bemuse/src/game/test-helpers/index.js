import { fromBMSChart } from '@mikuroxina/bemuse-notechart/lib/loader/BMSNotechartLoader.js'
import { Compiler } from '@mikuroxina/bms'
import tap from 'lodash/tap'

import Player from '../player.js'

export { tap }

export function chart(code = '') {
  return Compiler.compile(code).chart
}

export function notechart(code, options = {}) {
  return fromBMSChart(chart(code), options)
}

export function playerWithBMS(code, options = {}) {
  return new Player(notechart(code, options), 1, options)
}
