import type { PlayerOptions } from '@mikuroxina/bemuse-notechart'
import { fromBMSChart } from '@mikuroxina/bemuse-notechart/lib/loader/BMSNotechartLoader.js'
import { Compiler } from '@mikuroxina/bms'
import tap from 'lodash/tap'

import Player, { type PlayerOptionsInput } from '../player.js'

export { tap }

export function chart(code: string = '') {
  return Compiler.compile(code).chart
}

export function notechart(
  code?: string,
  options: PlayerOptions = { scratch: 'off' }
) {
  return fromBMSChart(chart(code), options)
}

export const defaultOptions: PlayerOptionsInput = {
  scratch: 'off',
  speed: 2,
  input: {
    keyboard: {
      '1': 'KeyS',
      '2': 'KeyD',
      '3': 'KeyF',
      '4': 'Space',
      '5': 'KeyJ',
      '6': 'KeyK',
      '7': 'KeyL',
      SC: 'ShiftLeft',
      SC2: 'KeyA',
    },
  },
}

export function playerWithBMS(
  code?: string,
  options: PlayerOptionsInput = defaultOptions
) {
  return new Player(notechart(code, options), 1, options)
}
