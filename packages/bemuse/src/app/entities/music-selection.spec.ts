import { produce } from 'immer'
import { describe, expect, it } from 'vitest'

import * as MusicSelection from './music-selection'

describe('selectedSongGivenSongs', function () {
  const dummy = {
    path: '',
    artist: '',
    genre: '',
    bpm: 120,
    replaygain: '-12.0 dB',
    charts: [],
    preview_url: '',
    bemusepack_url: '',
  }

  it('allows selecting song', () => {
    const actual = produce(MusicSelection.selectSong('song1'))(
      MusicSelection.initialState
    )

    expect(
      MusicSelection.selectedSongGivenSongs([
        { ...dummy, id: 'song0', title: 'TEST' },
        { ...dummy, id: 'song1', title: 'BY MY SIDE' },
      ])(actual)
    ).toStrictEqual({ ...dummy, id: 'song1', title: 'BY MY SIDE' })
  })
  it('should fallback to avilaable song if not available', () => {
    const actual = produce(MusicSelection.selectSong('song1'))(
      MusicSelection.initialState
    )

    expect(
      MusicSelection.selectedSongGivenSongs([
        { ...dummy, id: 'song0', title: 'TEST' },
        { ...dummy, id: 'song2', title: 'RUNNING OUT' },
      ])(actual)
    ).toStrictEqual({ ...dummy, id: 'song0', title: 'TEST' })
  })
  it('should allow selecting chart', () => {
    const actual = produce(
      MusicSelection.selectChart('song1', 'chart1.bml', 8)
    )(MusicSelection.initialState)

    expect(actual.selectedSongId).toStrictEqual('song1')
    expect(actual.selectedChartId).toStrictEqual('chart1.bml')
    expect(actual.selectedChartLevel).toStrictEqual(8)
  })
})

describe('selectedChartGivenCharts', function () {
  const dummyInfo = {
    title: '',
    artist: '',
    genre: '',
    subtitles: [],
    subartists: [],
    difficulty: 2,
  }
  const dummy = {
    md5: '',
    noteCount: 42,
    bpm: { init: 120, min: 120, median: 120, max: 120 },
    duration: 42,
    scratch: false,
    keys: '5K' as const,
  }

  const givenSelectedChart = produce(
    MusicSelection.selectChart('song1', 'chart1.bml', 8)
  )(MusicSelection.initialState)
  it('selects the chart if available', () => {
    expect(
      MusicSelection.selectedChartGivenCharts([
        { ...dummy, file: 'chart0.bml', info: { ...dummyInfo, level: 1 } },
        { ...dummy, file: 'chart1.bml', info: { ...dummyInfo, level: 8 } },
        { ...dummy, file: 'chart2.bml', info: { ...dummyInfo, level: 12 } },
      ])(givenSelectedChart)
    ).toStrictEqual({
      ...dummy,
      file: 'chart1.bml',
      info: { ...dummyInfo, level: 8 },
    })
  })
  it('selects chart with closest level if matching chart not available', () => {
    expect(
      MusicSelection.selectedChartGivenCharts([
        { ...dummy, file: 'pattern0.bml', info: { ...dummyInfo, level: 2 } },
        { ...dummy, file: 'pattern1.bml', info: { ...dummyInfo, level: 9 } },
        { ...dummy, file: 'pattern2.bml', info: { ...dummyInfo, level: 10 } },
      ])(givenSelectedChart)
    ).toStrictEqual({
      ...dummy,
      file: 'pattern1.bml',
      info: { ...dummyInfo, level: 9 },
    })
  })
})
