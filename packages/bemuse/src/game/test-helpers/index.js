import { fromBMSChart } from 'bemuse-notechart/lib/loader/BMSNotechartLoader.js'
import { Compiler } from 'bms'
import _ from 'lodash'

import Player from '../player.js'

export const tap = _.tap

export function chart(code = '') {
  return Compiler.compile(code).chart
}

export function notechart(code, options = {}) {
  return fromBMSChart(chart(code), options)
}

export function playerWithBMS(code, options = {}) {
  return new Player(notechart(code, options), 1, options)
}
