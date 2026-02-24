import { Then } from '@cucumber/cucumber'
import { expect } from 'vitest'

Then(/^note spacing at beat ([-\d.]+) is ([-\d.]+)$/, function (beat, value) {
  expect(this.spacing.factor(+beat)).to.equal(+value)
})
