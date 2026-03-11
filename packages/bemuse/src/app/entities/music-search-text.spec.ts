import { describe, expect, it } from 'vitest'

import * as MusicSearchText from './music-search-text.js'

describe('MusicSearchText', function () {
  it('is initially blank', () => {
    const state = MusicSearchText.initialState

    expect(MusicSearchText.searchText(state)).toStrictEqual('')
    expect(MusicSearchText.inputText(state)).toStrictEqual('')
  })

  it('should set inputText when typing', () => {
    const actual = MusicSearchText.handleTextType('hello')(
      MusicSearchText.initialState
    )

    expect(MusicSearchText.searchText(actual)).toStrictEqual('')
    expect(MusicSearchText.inputText(actual)).toStrictEqual('hello')
  })

  it('should copy inputText to searchText when debounced', () => {
    const actual = MusicSearchText.handleDebounce(
      MusicSearchText.handleTextType('hello')(MusicSearchText.initialState)
    )

    expect(MusicSearchText.searchText(actual)).toStrictEqual('hello')
    expect(MusicSearchText.inputText(actual)).toStrictEqual('hello')
  })

  it('should allow setting text, changing both', () => {
    const actual = MusicSearchText.setText('meow')()

    expect(MusicSearchText.searchText(actual)).toStrictEqual('meow')
    expect(MusicSearchText.inputText(actual)).toStrictEqual('meow')
  })
})
