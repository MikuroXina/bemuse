import { describe, expect, it } from 'vitest'

import { notechart } from '../test-helpers/index.js'
import PlayerStats from './player-stats.js'

describe('PlayerStats', function () {
  const statsFor5Notes = () => new PlayerStats(notechart('#00111:1111111111'))
  const statsFor1000Notes = () =>
    new PlayerStats(notechart('#00111:' + '11'.repeat(1000)))

  describe('#score', function () {
    it('returns the score', function () {
      const stats = statsFor5Notes()
      expect(stats.score).toStrictEqual(0)
      stats.handleJudgment(1)
      stats.handleJudgment(1)
      stats.handleJudgment(1)
      stats.handleJudgment(1)
      stats.handleJudgment(1)
      expect(stats.score).toStrictEqual(555555)
    })
  })

  describe('#comboScore', function () {
    it('returns the score', function () {
      const stats = statsFor1000Notes()
      expect(stats.comboScore).toStrictEqual(0)
      for (let i = 0; i < 1000; i++) {
        stats.handleJudgment(1)
      }
      expect(stats.comboScore).toStrictEqual(55555)
    })
  })

  describe('#maxPossibleComboScore', function () {
    it('is always 55555 in best case', function () {
      const stats = statsFor1000Notes()
      expect(stats.maxPossibleComboScore).toStrictEqual(55555)
      for (let i = 0; i < 1000; i++) {
        stats.handleJudgment(1)
        expect(stats.maxPossibleComboScore).toStrictEqual(55555)
      }
    })
    it('decreases to 0 in worst case', function () {
      const stats = statsFor5Notes()
      expect(stats.maxPossibleComboScore).toStrictEqual(55555)
      stats.handleJudgment(-1)
      expect(stats.maxPossibleComboScore).toBeLessThan(55555)
      for (let i = 0; i < 999; i++) {
        stats.handleJudgment(-1)
      }
      expect(stats.maxPossibleComboScore).toStrictEqual(0)
    })
  })

  describe('#maxPossibleScore', function () {
    it('is always 555555 in best case', function () {
      const stats = statsFor1000Notes()
      expect(stats.maxPossibleScore).toStrictEqual(555555)
      for (let i = 0; i < 1000; i++) {
        stats.handleJudgment(1)
        expect(stats.maxPossibleScore).toStrictEqual(555555)
      }
    })
    it('decreases to 0 in worst case', function () {
      const stats = statsFor1000Notes()
      expect(stats.maxPossibleScore).toStrictEqual(555555)
      stats.handleJudgment(-1)
      expect(stats.maxPossibleScore).toBeLessThan(555555)
      expect(stats.maxPossibleScore).toBeGreaterThan(stats.score)
      for (let i = 0; i < 999; i++) {
        stats.handleJudgment(-1)
      }
      expect(stats.maxPossibleScore).toStrictEqual(0)
    })
  })

  describe('#deltas', function () {
    it('returns the deltas', function () {
      const stats = new PlayerStats(notechart('#00111:111111'))
      stats.handleDelta(0.031)
      stats.handleDelta(0.001)
      stats.handleDelta(-0.031)
      expect(stats.deltas).to.deep.equal([0.031, 0.001, -0.031])
    })
  })

  describe('#log', function () {
    it('returns the log', function () {
      const stats = new PlayerStats(notechart('#00111:11111111111111'))
      expect(stats.score).to.equal(0)
      stats.handleJudgment(1)
      stats.handleJudgment(1)
      stats.handleJudgment(1)
      stats.handleJudgment(2)
      stats.handleJudgment(3)
      stats.handleJudgment(-1)
      stats.handleJudgment(-1)
      expect(stats.log).to.equal('3ABC2M')
    })
  })
})
