import { Given } from '@cucumber/cucumber'

Given(/^a BMS file as follows$/, function (string) {
  this.parseBMS(string)
})
