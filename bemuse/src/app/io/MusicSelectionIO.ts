import type { Chart, Song } from '@bemuse/collection-model/types.js'
import { SceneManager } from '@bemuse/scene-manager/index.js'
import type { SongMetadataInCollection } from 'bemuse-types'
import type { AnyAction, Dispatch } from 'redux'

import { rageQuitSlice } from '../../redux/ReduxState.js'
import {
  getChartLevel,
  musicSelectionSlice,
} from '../entities/MusicSelection.js'
import { optionsSlice, type OptionsState } from '../entities/Options.js'
import { launch } from '../game-launcher.js'
import type { ChartProps } from '../ui/MusicList.js'

export function selectSong(
  song: SongMetadataInCollection,
  dispatch: Dispatch<AnyAction>
) {
  dispatch(musicSelectionSlice.actions.MUSIC_SONG_SELECTED({ songId: song.id }))
}

export function selectChart(
  song: SongMetadataInCollection,
  chart: ChartProps,
  dispatch: Dispatch<AnyAction>
) {
  dispatch(
    musicSelectionSlice.actions.MUSIC_CHART_SELECTED({
      songId: song.id,
      chartId: chart.file,
      chartLevel: getChartLevel(chart),
    })
  )
}

export function launchGame({
  server,
  song,
  chart,
  autoplayEnabled,
  dispatch,
  options,
  sceneManager,
}: {
  server: { readonly url: string }
  song: Song
  chart: Chart
  autoplayEnabled: boolean
  options: OptionsState
  dispatch: Dispatch<AnyAction>
  sceneManager: SceneManager
}) {
  launch({
    server,
    song,
    chart,
    options,
    saveSpeed: (speed) => {
      dispatch(optionsSlice.actions.CHANGE_SPEED({ speed: speed.toString() }))
    },
    saveLeadTime: (leadTime) => {
      dispatch(optionsSlice.actions.CHANGE_LEAD_TIME({ leadTime }))
    },
    onRagequitted: () => {
      dispatch(rageQuitSlice.actions.RAGEQUITTED())
    },
    autoplayEnabled,
    sceneManager,
  })
}
