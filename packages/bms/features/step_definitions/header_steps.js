import { Then } from '@cucumber/cucumber'
import { expect } from 'vitest'

Then(
  /^the header "([^"]*)" should have value "([^"]*)"$/,
  function (name, value) {
    expect(this.chart.headers.get(name)).to.equal(value)
  }
)
