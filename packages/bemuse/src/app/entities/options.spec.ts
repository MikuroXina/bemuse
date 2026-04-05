import type { UnknownAction } from 'redux'
import { assert, describe, expect, it } from 'vitest'

import * as Options from './options'

const update = (action: UnknownAction) => (state: Options.OptionsState) =>
  Options.optionsSlice.reducer(state, action)
const actions = Options.optionsSlice.actions

const initialState = Options.optionsSlice.getInitialState()

describe('Lane cover', () => {
  it('should be a number', () => {
    assert(
      Options.laneCover({ ...initialState, 'player.P1.lane-cover': '0' }) === 0
    )
  })
  it('should be maximum 50%', () => {
    assert(
      Options.laneCover({ ...initialState, 'player.P1.lane-cover': '99' }) ===
        0.5
    )
  })
  it('should be minimum -50%', () => {
    assert(
      Options.laneCover({
        ...initialState,
        'player.P1.lane-cover': '-99',
      }) === -0.5
    )
  })
})

describe('key config', () => {
  it('can be set and get', () => {
    const actual = update(
      actions.CHANGE_KEY_MAPPING({ mode: 'KB', key: '4', keyCode: '65' })
    )(Options.initialState)

    expect(Options.getKeyMapping('KB', '4')(actual)).toStrictEqual('65')
  })
  it('can be retrieved for current mode by column', () => {
    const actual1 = update(actions.CHANGE_PLAY_MODE({ mode: 'KB' }))(
      Options.initialState
    )

    // KB mode, 4th button is space.
    expect(Options.keyboardMapping(actual1)['4']).toStrictEqual('Space')

    const actual2 = update(actions.CHANGE_PLAY_MODE({ mode: 'BM' }))(
      Options.initialState
    )

    expect(Options.keyboardMapping(actual2)['4']).toStrictEqual('KeyD')
  })
  describe('key setting progression (in options screen)', () => {
    it('SC → SC2', () => {
      expect(Options.nextKeyToEdit('SC', 'left')).toStrictEqual('SC2')
      expect(Options.nextKeyToEdit('SC', 'right')).toStrictEqual('SC2')
    })
    it('1 → 2', () => {
      expect(Options.nextKeyToEdit('1', 'left')).toStrictEqual('2')
      expect(Options.nextKeyToEdit('1', 'right')).toStrictEqual('2')
      expect(Options.nextKeyToEdit('1', 'off')).toStrictEqual('2')
    })
    it('7 → done (scratch off / left)', () => {
      expect(Options.nextKeyToEdit('7', 'off')).toStrictEqual(null)
      expect(Options.nextKeyToEdit('7', 'left')).toStrictEqual(null)
    })
    it('7 → SC (scratch right)', () => {
      expect(Options.nextKeyToEdit('7', 'right')).toStrictEqual('SC')
    })
    it('SC2 → done (scratch right)', () => {
      expect(Options.nextKeyToEdit('SC2', 'right')).toStrictEqual(null)
    })
    it('SC2 → 1 (scratch left)', () => {
      expect(Options.nextKeyToEdit('SC2', 'left')).toStrictEqual('1')
    })
  })
})

describe('speed', () => {
  it('can be set and get', () => {
    const actual = update(actions.CHANGE_SPEED({ speed: 4.5 }))(
      Options.initialState
    )

    expect(Options.speed(actual)).toStrictEqual(4.5)
  })
})

describe('lead time', () => {
  it('defaults to 1685 ms (initial speed of tutorial)', () => {
    expect(Options.leadTime(Options.initialState)).toStrictEqual(1685)
  })
})

describe('scratch position', () => {
  it('switches to keyboard mode if off', () => {
    const actual = update(actions.CHANGE_SCRATCH_POSITION({ position: 'off' }))(
      Options.initialState
    )

    expect(Options.scratchPosition(actual)).toStrictEqual('off')
    expect(actual['player.P1.mode']).toStrictEqual('KB')
  })
  it('switches to BMS mode if on', () => {
    const actual = update(
      actions.CHANGE_SCRATCH_POSITION({ position: 'right' })
    )(Options.initialState)

    expect(Options.scratchPosition(actual)).toStrictEqual('right')
    expect(actual['player.P1.mode']).toStrictEqual('BM')
  })
  it('remembers previous scratch position prior to turning off', () => {
    const actual = update(actions.CHANGE_SCRATCH_POSITION({ position: 'off' }))(
      update(actions.CHANGE_SCRATCH_POSITION({ position: 'right' }))(
        Options.initialState
      )
    )

    expect(Options.scratchPosition(actual)).toStrictEqual('off')
    expect(actual['player.P1.mode']).toStrictEqual('KB')
    expect(actual['player.P1.scratch']).toStrictEqual('right')
  })
})

describe('background animations', () => {
  itCanBeToggled({
    check: Options.isBackgroundAnimationsEnabled,
    toggle: update(actions.TOGGLE_BACKGROUND_ANIMATIONS()),
    defaultSetting: true,
  })
})

describe('auto velocity', () => {
  itCanBeToggled({
    check: Options.isAutoVelocityEnabled,
    toggle: update(actions.TOGGLE_AUTO_VELOCITY()),
    defaultSetting: false,
  })
})

describe('expert gauge', () => {
  itCanBeToggled({
    check: Options.isGaugeEnabled,
    toggle: update(actions.TOGGLE_GAUGE()),
    defaultSetting: false,
  })
})

describe('new feature announcements', () => {
  it('should track its acknowledgement', () => {
    expect(
      Options.hasAcknowledged('twitter')(Options.initialState)
    ).toStrictEqual(false)
  })
  it('can be acknowledged by the user', () => {
    const actual = update(actions.ACKNOWLEDGE({ featureKey: 'twitter' }))(
      Options.initialState
    )

    expect(Options.hasAcknowledged('twitter')(actual)).toStrictEqual(true)
  })
})

describe('auto/input latency', () => {
  it('defaults to 0', () => {
    expect(Options.audioInputLatency(Options.initialState)).toStrictEqual(0)
  })
  it('can be adjusted', () => {
    const actual = update(
      actions.CHANGE_AUDIO_INPUT_LATENCY({
        latency: 32,
      })
    )(Options.initialState)

    expect(Options.audioInputLatency(actual)).toStrictEqual(32)
  })
})

describe('last used version', () => {
  it('should be tracked so that it can display “what’s new” dialog', () => {
    const actual = update(
      actions.UPDATE_LAST_SEEN_VERSION({
        newVersion: '50.0',
      })
    )(Options.initialState)

    expect(Options.lastSeenVersion(actual)).toStrictEqual('50.0')
  })
})

function itCanBeToggled({
  check,
  toggle,
  defaultSetting,
}: {
  check: (state: Options.OptionsState) => boolean
  toggle: (state: Options.OptionsState) => Options.OptionsState
  defaultSetting: boolean
}) {
  it('defaults to ' + defaultSetting, () => {
    expect(check(Options.initialState)).toStrictEqual(defaultSetting)
  })
  it('can be toggled', () => {
    expect(check(toggle(Options.initialState))).toStrictEqual(!defaultSetting)
  })
  it('can be toggled again', () => {
    expect(check(toggle(toggle(Options.initialState)))).toStrictEqual(
      defaultSetting
    )
  })
}
