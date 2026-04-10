import type Notechart from '@mikuroxina/bemuse-notechart'
import type { GameNote } from '@mikuroxina/bemuse-notechart'
import { assert, beforeEach, describe, expect, it, vi } from 'vitest'

import GameInput, { type IGameInputPlugin } from '../input'
import Control from '../input/control'
import Player, { type PlayerOptionsInput } from '../player'
import { defaultOptions, notechart } from '../test-helpers'
import PlayerState from './player-state'

describe('PlayerState', function () {
  it('updates the input', function () {
    const state = new PlayerState({
      number: 1,
      columns: ['wow'],
      notechart: notechart(''),
      options: {
        autoplayEnabled: false,
        autosound: false,
        speed: 1,
        placement: 'center',
        scratch: 'left',
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
        laneCover: 0,
        gauge: 'off',
        tutorial: false,
      },
    })

    const input = new GameInput()
    input.use({
      name: 'wow_controller',
      get: () => ({ wow: 1 }),
    })
    state.update(0, input)

    expect(state.input.get('wow')).toStrictEqual(new Control(0, false))
  })

  describe('with player and chart', function () {
    let chart: Notechart
    let player: Player
    let state: PlayerState
    let input: GameInput
    const plugin: IGameInputPlugin = {
      name: 'test_controller',
      get: () => ({}),
    }

    function setup(
      bms: string,
      options: Partial<PlayerOptionsInput> = {
        speed: 1,
      }
    ) {
      chart = notechart(bms)
      player = new Player(chart, 1, { ...defaultOptions, ...options })
      state = new PlayerState(player)
      input = new GameInput()
      input.use(plugin)
    }

    function advance(time: number, b: Record<string, number>) {
      vi.spyOn(plugin, 'get').mockReturnValue(b)
      input.update()
      state.update(time, input)
    }

    describe('node judging', function () {
      it('judges notes', function () {
        setup(`
          #BPM 120
          #00111:0101
        `)

        const column = chart.notes[0].column

        assert.equal(state.getNoteStatus(chart.notes[0]), 'unjudged')
        assert.equal(state.stats.combo, 0)
        assert.equal(state.stats.poor, false)
        assert.equal(state.stats.totalCombo, 2)
        assert.equal(state.notifications.judgments.length, 0)

        advance(1.999, {})
        assert.equal(state.getNoteStatus(chart.notes[0]), 'unjudged')

        advance(2, { p1_1: 1 })
        assert.equal(state.getNoteStatus(chart.notes[0]), 'judged')
        assert.equal(state.getNoteJudgment(chart.notes[0]), 1)
        assert.equal(state.getNoteStatus(chart.notes[1]), 'unjudged')
        assert.deepEqual(state.notifications.judgments[0], {
          judgment: 1,
          combo: 1,
          delta: 0,
          column,
        })
        assert(!state.stats.poor)

        advance(2.1, { p1_1: 0 })
        advance(5, { p1_1: 0 })
        assert.equal(state.getNoteStatus(chart.notes[1]), 'judged')
        assert.equal(state.getNoteJudgment(chart.notes[1]), -1)
        assert.deepEqual(state.notifications.judgments[0], {
          judgment: -1,
          combo: 0,
          delta: 2,
          column,
        })
        assert.equal(state.stats.poor, true)
      })

      it('judges multiple notes in different column', function () {
        setup(`
          #BPM 120
          #00111:01
          #00112:01
        `)

        advance(2, { p1_1: 1, p1_2: 1 })
        assert(state.getNoteStatus(chart.notes[0]) === 'judged')
        assert(state.getNoteStatus(chart.notes[1]) === 'judged')
      })

      it('judges single note from one column at a time', function () {
        setup(`
          #BPM 480
          #00111:01010100000000000000000000000000
        `)

        advance(0.531, { p1_1: 1 })
        assert(state.getNoteStatus(chart.notes[0]) === 'judged')
        assert(state.getNoteStatus(chart.notes[1]) === 'unjudged')
        assert(state.getNoteStatus(chart.notes[2]) === 'unjudged')
        advance(0.531, { p1_1: 0 })
        advance(0.531, { p1_1: 1 })
        assert(state.getNoteStatus(chart.notes[0]) === 'judged')
        assert(state.getNoteStatus(chart.notes[1]) === 'judged')
        assert(state.getNoteStatus(chart.notes[2]) === 'unjudged')
        advance(0.531, { p1_1: 0 })
        advance(0.531, { p1_1: 1 })
        assert(state.getNoteStatus(chart.notes[0]) === 'judged')
        assert(state.getNoteStatus(chart.notes[1]) === 'judged')
        assert(state.getNoteStatus(chart.notes[2]) === 'judged')

        assert(state.getNoteJudgment(chart.notes[0]) > 1)
        assert(state.getNoteJudgment(chart.notes[1]) === 1)
        assert(state.getNoteJudgment(chart.notes[2]) > 1)
      })

      it('leaves note unjudged when bad and there are closer note', function () {
        setup(`
          #BPM 120
          #00111:01010100000000000000000000000000
        `)

        advance(2.125, { p1_1: 1 })
        assert(state.getNoteStatus(chart.notes[0]) === 'unjudged')
        assert(state.getNoteStatus(chart.notes[1]) === 'judged')
        assert(state.getNoteStatus(chart.notes[2]) === 'unjudged')
      })

      it('records delta when pressed', function () {
        setup(`
          #BPM 120
          #00111:01
        `)
        const mock = vi.spyOn(state.stats, 'handleDelta')
        advance(2.01, { p1_1: 1 })
        expect(mock).toHaveBeenCalledWith(2.01 - 2)
      })

      it('does not record delta when missed', function () {
        setup(`
          #BPM 120
          #00111:01
        `)
        const mock = vi.spyOn(state.stats, 'handleDelta')
        advance(9, { p1_1: 1 })
        expect(mock).not.toHaveBeenCalled()
      })

      describe('with long note', function () {
        let note: GameNote
        beforeEach(function () {
          setup(`
            #BPM 120
            #00151:0101
          `)
          note = chart.notes[0]
        })
        it('judges long note', function () {
          advance(2, { p1_1: 1 })
          assert(state.getNoteStatus(note) === 'active')
          assert(state.getNoteJudgment(note) === 1)
          assert(state.notifications.judgments[0].judgment === 1)
          advance(3, { p1_1: 0 })
          assert(state.getNoteStatus(note) === 'judged')
          assert(state.getNoteJudgment(note) === 1)
          assert(state.notifications.judgments[0].judgment === 1)
        })
        it('gives 2 discrete judgments, one for down and one for up', function () {
          advance(2, { p1_1: 1 })
          expect(state.stats.numJudgments).toStrictEqual(1)
          advance(3, { p1_1: 0 })
          expect(state.stats.numJudgments).toStrictEqual(2)
        })
        it('records delta once', function () {
          const mock = vi.spyOn(state.stats, 'handleDelta')
          advance(2, { p1_1: 1 })
          advance(3, { p1_1: 0 })
          expect(mock).toHaveBeenCalledOnce()
        })
        it('judges missed long note', function () {
          advance(2.3, { p1_1: 1 })
          assert(state.getNoteStatus(note) === 'judged')
          assert(state.getNoteJudgment(note) === -1)
        })
        it('gives 2 missed judgment for missed longnote', function () {
          advance(2.3, { p1_1: 1 })
          assert(state.stats.numJudgments === 2)
        })
        it('judges long note lifted too fast as missed', function () {
          advance(2, { p1_1: 1 })
          advance(2.01, { p1_1: 0 })
          assert(state.getNoteStatus(note) === 'judged')
          assert(state.getNoteJudgment(note) === -1)
          assert(state.stats.numJudgments === 2)
        })
        it('does not end automatically', function () {
          advance(2, { p1_1: 1 })
          advance(3.1, { p1_1: 1 })
          assert(state.getNoteStatus(note) === 'active')
          assert(state.stats.numJudgments === 1)
        })
        it('judges long note lifted too slow as missed', function () {
          advance(2, { p1_1: 1 })
          advance(4, { p1_1: 1 })
          assert(state.getNoteStatus(note) === 'judged')
          assert(state.getNoteJudgment(note) === -1)
          assert.deepEqual(state.notifications.judgments[0], {
            judgment: -1,
            combo: 0,
            delta: 1,
            column: note.column,
          })
        })
      })

      describe('with long scratch note', function () {
        let note: GameNote
        beforeEach(function () {
          setup(`
            #BPM 120
            #00156:0101
          `)
          note = chart.notes[0]
        })
        it('ends automatically', function () {
          advance(2, { p1_SC: 1 })
          assert(state.getNoteStatus(note) === 'active')
          assert(state.getNoteJudgment(note) === 1)
          assert(state.notifications.judgments[0].judgment === 1)
          advance(3.1, { p1_SC: 1 })
          assert(state.getNoteStatus(note) === 'judged')
          assert(state.getNoteJudgment(note) === 1)
          assert(state.notifications.judgments[0].judgment === 1)
        })
      })

      describe('with long scratch note next to each other', function () {
        beforeEach(function () {
          setup(`
#BPM 120
#00156:0100000000000000000000000000000000000000000000000000000000000001
#00256:0100000000000000000000000000000000000000000000000000000000000001
          `)
        })
        it('should switch to next one on change', function () {
          advance(2, { p1_SC: 1 })
          advance(4, { p1_SC: -1 })
          assert(state.getNoteStatus(chart.notes[0]) === 'judged')
          assert(state.getNoteStatus(chart.notes[1]) === 'active')
        })
      })

      describe('sound notifications', function () {
        it('notifies of note hit', function () {
          setup(`
            #BPM 120
            #00111:0102
          `)
          advance(2, { p1_1: 1 })
          expect(state.notifications.sounds[0].note).toStrictEqual(
            chart.notes[0]
          )
          assert(state.notifications.sounds[0].type === 'hit')
        })
        it('should notify missed notes as break', function () {
          setup(`
            #BPM 120
            #00111:01
          `)
          advance(5, { p1_1: 0 })
          expect(state.notifications.sounds[0].note).toStrictEqual(
            chart.notes[0]
          )
          assert(state.notifications.sounds[0].type === 'break')
        })
        it('notifies of free keysound hit', function () {
          setup(`
            #BPM 60
            #00111:01
            #00211:02
          `)

          // hit the first note
          advance(4, { p1_1: 1 })
          advance(4, { p1_1: 0 })

          // hit the blank area
          advance(4, { p1_1: 1 })
          expect(state.notifications.sounds[0].note).toStrictEqual(
            chart.notes[0]
          )
          expect(state.notifications.sounds[0].type).toStrictEqual('free')

          // release the button
          advance(4, { p1_1: 0 })
          assert(!state.notifications.sounds.length)

          // try again
          advance(5, { p1_1: 1 })
          expect(state.notifications.sounds[0].note).toStrictEqual(
            chart.notes[0]
          )

          // release the button
          advance(5, { p1_1: 0 })

          // wait and try again.
          advance(6.5, { p1_1: 1 })
          expect(state.notifications.sounds[0].note).toStrictEqual(
            chart.notes[0]
          )
          advance(6.5, { p1_1: 0 })

          // wait and try again. this time keysound should change
          advance(7.5, { p1_1: 1 })
          expect(state.notifications.sounds[0].note).toStrictEqual(
            chart.notes[1]
          )
        })
        it('suppresses freestyle keysound when column is sandwiched between 2 adjacent notes in 3d mode', function () {
          setup(
            `
              #BPM 60
              #00111:01
              #00212:02
              #00113:02
            `,
            { speed: 1, placement: '3d' }
          )
          advance(1, { p1_2: 1 })
          expect(state.notifications.sounds.length).toStrictEqual(1)
          advance(1, { p1_2: 0 })

          advance(4, { p1_2: 1 })
          expect(state.notifications.sounds.length).toStrictEqual(0)
          advance(4, { p1_2: 0 })
        })
        it('does not suppress freestyle keysound outside 3d mode', function () {
          setup(
            `
              #BPM 60
              #00111:01
              #00212:02
              #00113:02
            `,
            { speed: 1, placement: 'left' }
          )
          advance(1, { p1_2: 1 })
          assert.equal(state.notifications.sounds.length, 1)
          advance(1, { p1_2: 0 })

          advance(4, { p1_2: 1 })
          assert.equal(state.notifications.sounds.length, 1)
          advance(4, { p1_2: 0 })
        })
      })
    })

    describe('speed', function () {
      it('infers speed from player', function () {
        setup('', { speed: 2 })
        assert(state.speed === 2)
      })
      it('updates speed on dedicated buttons', function () {
        setup('', { speed: 2 })
        advance(1.0, { p1_speedup: 1 })
        expect(state.speed).toStrictEqual(2.5)
        advance(1.2, { p1_speedup: 0, p1_speeddown: 1 })
        expect(state.speed).toStrictEqual(2)
      })
      it('supports fine-grained speed modifications', function () {
        setup('', { speed: 2 })
        advance(1.0, { p1_speedup: 1, select: 1 })
        assert(state.speed === 2.1)
      })
      it('supports pinching to zoom', function () {
        setup('', { speed: 2 })
        advance(1.0, { p1_pinch: 300 })
        advance(1.2, { p1_pinch: 450 })
        assert(state.speed === 3)
      })
    })

    describe('finish', function () {
      it('should become true when song is finished', function () {
        setup('#00111:0101')
        expect(state.finished).toStrictEqual(false)
        advance(4.0, {})
        expect(state.finished).toStrictEqual(false)
        advance(16.0, {})
        expect(state.finished).toStrictEqual(true)
      })
    })
  })
})
