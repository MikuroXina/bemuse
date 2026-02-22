import { World } from '@cucumber/cucumber'
import { setWorldConstructor } from '@cucumber/cucumber'
import { expect } from 'vitest'

import {
  Compiler,
  Keysounds,
  Notes,
  Positioning,
  SongInfo,
  Spacing,
  Timing,
} from '../../lib/index.js'

class BmsWorld extends World {
  parseOptions = {}

  parseBMS(string) {
    this.source = string
    this.result = Compiler.compile(this.source, this.parseOptions)
    this.chart = this.result.chart
  }

  getObject(value) {
    const matching = this.chart.objects.all().filter(function (object) {
      return object.value === value
    })
    expect(matching).to.have.length(1, 'getObject(' + value + ')')
    return matching[0]
  }

  getNote(value) {
    const matching = this.notes.all().filter(function (object) {
      return object.keysound === value
    })
    expect(matching).to.have.length(1, 'getNote(' + value + ')')
    return matching[0]
  }

  get timing() {
    return Timing.fromBMSChart(this.chart)
  }

  get notes() {
    return Notes.fromBMSChart(this.chart)
  }

  get songInfo() {
    return SongInfo.fromBMSChart(this.chart)
  }

  get keysounds() {
    return Keysounds.fromBMSChart(this.chart)
  }

  get positioning() {
    return Positioning.fromBMSChart(this.chart)
  }

  get spacing() {
    return Spacing.fromBMSChart(this.chart)
  }
}

setWorldConstructor(BmsWorld)
