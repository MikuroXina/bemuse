import keysoundCache from '@bemuse/keysound-cache/index.js'
import Progress from '@bemuse/progress/index.js'
import { atomic } from '@bemuse/progress/utils.js'
import { resolveRelativeResources } from '@bemuse/resources/resolveRelativeResource.js'
import SamplingMaster from '@bemuse/sampling-master/index.js'
import type { Notechart, PlayerOptions } from 'bemuse-notechart'
import { NotechartLoader } from 'bemuse-notechart/lib/loader/index.js'

import GameAudio from '../audio/index.js'
import GameDisplay from '../display/index.js'
import Game from '../game.js'
import GameController from '../game-controller.js'
import type { LoadSpec } from './load-spec.js'
import loadImage from './loadImage.js'
import * as Multitasker from './multitasker.js'
import SamplesLoader from './samples-loader.js'

type Tasks = {
  Scintillator: TODO
  Skin: TODO
  SkinContext: TODO
  Notechart: Notechart
  EyecatchImage: HTMLImageElement
  BackgroundImage: HTMLImageElement
  SamplingMaster: SamplingMaster
  Video: { element: HTMLVideoElement; offset: number } | null
  Game: Game
  GameDisplay: GameDisplay
  Samples: TODO
  GameAudio: GameAudio
  GameController: GameController
}

export function load(spec: LoadSpec) {
  const assets = spec.assets
  const bms = spec.bms
  const songId = spec.songId

  return Multitasker.start<Tasks, GameController>(function (task, run) {
    task('Scintillator', 'Loading game engine', [], function (progress) {
      return atomic(progress, import('@bemuse/scintillator/index.js'))
    })

    task(
      'Skin',
      'Loading skin',
      ['Scintillator'],
      function (Scintillator, progress) {
        return Scintillator.load(
          Scintillator.getSkinUrl({
            displayMode: spec.displayMode,
          }),
          progress
        )
      }
    )

    task(
      'SkinContext',
      null,
      ['Scintillator', 'Skin'],
      function (Scintillator, skin) {
        return new Scintillator.Context(skin, { touchEventTarget: window })
      }
    )

    if (assets.progress) {
      if (assets.progress.current) {
        task.bar('Loading package', assets.progress.current)
      }
      if (assets.progress.all) {
        task.bar('Loading song packages', assets.progress.all)
      }
    }

    task('Notechart', 'Loading ' + spec.bms.name, [], async (progress) => {
      const loader = new NotechartLoader()
      const arraybuffer = await bms.read(progress)
      return loader.load(
        arraybuffer,
        spec.bms,
        spec.options.players[0] as PlayerOptions
      )
    })

    task('EyecatchImage', null, ['Notechart'], function (notechart) {
      if (spec.eyecatchImageUrl) {
        const [base, filename] = resolveRelativeResources(
          assets,
          spec.eyecatchImageUrl
        )
        return loadImage(base, filename)
      }
      return loadImage(assets, notechart.eyecatchImage)
    })

    task('BackgroundImage', null, ['Notechart'], function (notechart) {
      if (spec.backImageUrl) {
        const [base, filename] = resolveRelativeResources(
          assets,
          spec.backImageUrl
        )
        return loadImage(base, filename)
      }
      return loadImage(assets, notechart.backgroundImage)
    })

    const audioLoadProgress = new Progress()
    const audioDecodeProgress = new Progress()

    task.bar('Loading audio', audioLoadProgress)
    task.bar('Decoding audio', audioDecodeProgress)

    task('SamplingMaster', null, [], async () => {
      return new SamplingMaster()
    })

    task(
      'Video',
      spec.videoUrl ? 'Loading video' : null,
      ['Notechart'],
      async function (_notechart, progress) {
        if (!spec.videoUrl) return Promise.resolve(null)
        let videoUrl = spec.videoUrl
        if (!videoUrl.includes('://')) {
          // This is a relative URL, we need to load from assets.
          const [base, filename] = resolveRelativeResources(assets, videoUrl)
          const file = await base.file(filename)
          videoUrl = await file.resolveUrl()
        }
        return new Promise((resolve) => {
          const video = document.createElement('video')
          if (!video.canPlayType('video/webm')) return resolve(null)
          video.src = videoUrl
          video.preload = 'auto'
          video.addEventListener('progress', onProgress, true)
          video.addEventListener('canplaythrough', onCanPlayThrough, true)
          video.addEventListener('error', onError, true)
          video.addEventListener('abort', onError, true)
          video.load()

          function onProgress() {
            if (video.buffered && video.buffered.length && video.duration) {
              progress.report(
                video.buffered.end(0) - video.buffered.start(0),
                video.duration
              )
            }
          }
          function finish() {
            video.removeEventListener('progress', onProgress, true)
            video.removeEventListener('canplaythrough', onCanPlayThrough, true)
            video.removeEventListener('error', onError, true)
            video.removeEventListener('abort', onError, true)
          }
          function onCanPlayThrough() {
            finish()
            const n = video.duration || 100
            progress.report(n, n)
            resolve({ element: video, offset: spec.videoOffset! })
          }
          function onError() {
            finish()
            console.warn('Cannot load video... Just skip it!')
            resolve(null)
          }
        })
      }
    )

    task('Game', null, ['Notechart'], async (notechart) => {
      return new Game([notechart], spec.options)
    })

    task(
      'GameDisplay',
      null,
      ['Game', 'SkinContext', 'Video'],
      async (game, context, video) => {
        return new GameDisplay({
          game,
          context,
          backgroundImagePromise: run('BackgroundImage'),
          video,
        })
      }
    )

    task('Samples', null, ['SamplingMaster', 'Game'], function (master, game) {
      keysoundCache.receiveSongId(songId)
      const samplesLoader = new SamplesLoader(assets, master)
      return samplesLoader.loadFiles(
        game.samples,
        audioLoadProgress,
        audioDecodeProgress
      )
    })

    task(
      'GameAudio',
      null,
      ['Game', 'Samples', 'SamplingMaster'],
      async (game, samples, master) => {
        return new GameAudio({ game, samples, master })
      }
    )

    task(
      'GameController',
      null,
      ['Game', 'GameDisplay', 'GameAudio'],
      async (game, display, audio) => {
        return new GameController({ game, display, audio })
      }
    )

    return run('GameController')
  })
}
