import { assert, beforeEach, describe, expect, it, vi } from 'vitest'

import Control from '../input/control'
import type Player from '../player'
import type PlayerState from '../state/player-state'
import { notechart, playerWithBMS } from '../test-helpers'
import PlayerDisplay from './player-display'

describe('PlayerDisplay', function () {
  let display: PlayerDisplay
  let data: Record<string, unknown>

  function setup(player: Player) {
    display = new PlayerDisplay(player, 'normal')
  }

  function update(t1: number, t2: number, state: PlayerState) {
    data = display.update(t1, t2, state)
  }

  it('reacts to input', function () {
    const inputState = (inputs: [string, Control][]): PlayerState =>
      makeState({ input: new Map(inputs) }) as unknown as PlayerState

    setup({
      notechart: notechart(),
      columns: ['wow'],
      options: {
        placement: 'center',
        scratch: 'left',
      },
    } as unknown as Player)

    update(555, 0.5, inputState([['wow', new Control(0, false)]]))
    expect(data['wow_active']).toStrictEqual(0)

    update(557, 2.5, inputState([['wow', new Control(1, true)]]))
    expect(data['wow_active']).toStrictEqual(1)
    expect(data['wow_down']).toStrictEqual(557)

    update(558, 3.5, inputState([['wow', new Control(0, true)]]))
    expect(data['wow_active']).toStrictEqual(0)
    expect(data['wow_up']).toStrictEqual(558)
  })

  describe('with note', function () {
    beforeEach(function () {
      setup(playerWithBMS('#BPM 60\n#00111:11'))
    })
    it('displays unjudged notes', function () {
      update(3.95, 3.95, blankState() as unknown as PlayerState)
      expect(data['note_1']).to.have.length(1)
    })
    it('hides judged notes', function () {
      const state = blankState()
      state.getNoteStatus.mockReturnValue('judged')

      update(3.95, 3.95, state as unknown as PlayerState)
      expect(data['note_1'] ?? []).to.have.length(0)
    })
  })

  describe('with long note', function () {
    beforeEach(function () {
      setup(playerWithBMS('#BPM 60\n#00151:1111'))
    })
    it('displays unjudged long notes', function () {
      update(3.95, 3.95, blankState() as unknown as PlayerState)

      assert(Array.isArray(data['longnote_1']))
      expect(data['longnote_1'][0].active).toStrictEqual(false)
      expect(data['longnote_1'][0].missed).toStrictEqual(false)
    })
    it('displays holding long notes', function () {
      const state = blankState()
      state.getNoteJudgment.mockReturnValue(1)

      update(3.95, 3.95, state as unknown as PlayerState)

      assert(Array.isArray(data['longnote_1']))
      expect(data['longnote_1'][0].active).toStrictEqual(true)
    })
    it('displays holding long notes event it is bad', function () {
      const state = blankState()
      state.getNoteJudgment.mockReturnValue(4)

      update(3.95, 3.95, state as unknown as PlayerState)

      assert(Array.isArray(data['longnote_1']))
      expect(data['longnote_1'][0].active).toStrictEqual(true)
    })
    it('displays missed long notes', function () {
      const state = blankState()
      state.getNoteJudgment.mockReturnValue(-1)
      state.getNoteStatus.mockReturnValue('judged')

      update(3.95, 3.95, state as unknown as PlayerState)

      assert(Array.isArray(data['longnote_1']))
      expect(data['longnote_1'][0].missed).toStrictEqual(true)
    })
  })

  describe('with notification', function () {
    beforeEach(function () {
      setup(playerWithBMS())
    })
    it('sets judgment time', function () {
      const info = { judgment: 1, delta: 0, combo: 123, column: 'SC' }
      update(
        12,
        34,
        makeState({
          notifications: { judgments: [info] },
        }) as unknown as PlayerState
      )
      assert(data['judge_1'] === 12)
      assert(data['judge_deviation_none'] === 12)
    })
    it('sets judgment deviation (early)', function () {
      const info = { judgment: 2, delta: -0.03, combo: 123, column: 'SC' }
      update(
        12,
        34,
        makeState({
          notifications: { judgments: [info] },
        }) as unknown as PlayerState
      )
      assert(data['judge_2'] === 12)
      assert(data['judge_deviation_early'] === 12)
    })
    it('sets judgment deviation (late)', function () {
      const info = { judgment: 2, delta: 0.03, combo: 123, column: 'SC' }
      update(
        12,
        34,
        makeState({
          notifications: { judgments: [info] },
        }) as unknown as PlayerState
      )
      assert(data['judge_2'] === 12)
      assert(data['judge_deviation_late'] === 12)
    })
    it('sets judgment missed time', function () {
      const info = { judgment: -1, delta: 0, combo: 0, column: 'SC' }
      update(
        12,
        34,
        makeState({
          notifications: { judgments: [info] },
        }) as unknown as PlayerState
      )
      assert(data['judge_missed'] === 12)
    })
    it('sets combo', function () {
      const info = { judgment: 1, delta: 0, combo: 123, column: 'SC' }
      update(
        12,
        34,
        makeState({
          notifications: { judgments: [info] },
        }) as unknown as PlayerState
      )
      assert(data['combo'] === 123)
    })
    it('sets note explode time', function () {
      const info = { judgment: 1, delta: 0, combo: 123, column: 'SC' }
      update(
        12,
        34,
        makeState({
          notifications: { judgments: [info] },
        }) as unknown as PlayerState
      )
      assert(data['SC_explode'] === 12)
    })
    it('does not set note explode time if missed', function () {
      const info = { judgment: -1, delta: 0, combo: 123, column: 'SC' }
      update(
        12,
        34,
        makeState({
          notifications: { judgments: [info] },
        }) as unknown as PlayerState
      )

      expect(data['SC_explode'] ?? []).to.have.length(0)
    })
  })

  // Mock PlayerState
  function blankState() {
    return {
      speed: 1,
      input: { get: () => ({ value: 0, changed: false }) },
      notifications: { judgments: [] },
      getNoteStatus: vi.fn().mockReturnValue('unjudged'),
      getNoteJudgment: vi.fn().mockReturnValue(0),
      stats: { score: 0 },
    }
  }

  function makeState(object: Record<string, unknown>) {
    return { ...blankState(), ...object }
  }
})
