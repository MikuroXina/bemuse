import keysoundCache from '@bemuse/keysound-cache/index.js'
import Progress from '@bemuse/progress/index.js'
import { resolveRelativeResources } from '@bemuse/resources/resolve-relative-resource.js'
import SamplingMaster from '@bemuse/sampling-master/index.js'
import type { PlayerOptions } from '@mikuroxina/bemuse-notechart'
import { NotechartLoader } from '@mikuroxina/bemuse-notechart/lib/loader/index.js'

import GameAudio from '../audio/index.js'
import GameDisplay from '../display/index.js'
import Game from '../game.js'
import GameController from '../game-controller.js'
import loadImage from './load-image.js'
import type { LoadSpec } from './load-spec.js'
import { begin } from './multitasker.js'
import SamplesLoader from './samples-loader.js'

export function load(spec: LoadSpec) {
  const assets = spec.assets
  const bms = spec.bms
  const songId = spec.songId

  const container1 = begin().task(
    'Skin',
    [],
    async (_, progress) => {
      const mod = await import('@bemuse/scintillator/index.js')
      return mod.load(
        mod.getSkinUrl({
          displayMode: spec.displayMode,
        }),
        progress
      )
    },
    'Loading skin'
  )
  let container2 = container1
  if (assets.progress) {
    if (assets.progress.current) {
      container2 = container1.pushMessage(
        '_package',
        'Loading package',
        assets.progress.current
      )
    }
    if (assets.progress.all) {
      container2 = container1.pushMessage(
        '_package',
        'Loading song packages',
        assets.progress.all
      )
    }
  }
  const container3 = container2
    .task(
      'Notechart',
      [],
      async (_, progress) => {
        const loader = new NotechartLoader()
        const arraybuffer = await bms.read(progress)
        return loader.load(
          arraybuffer,
          spec.bms,
          spec.options.players[0] as PlayerOptions
        )
      },
      `Loading ${spec.bms.name}`
    )
    .task('EyecatchImage', ['Notechart'], async ({ Notechart }) => {
      try {
        if (spec.eyecatchImageUrl) {
          const [base, filename] = resolveRelativeResources(
            assets,
            spec.eyecatchImageUrl
          )
          return await loadImage(base, filename)
        }
        return await loadImage(assets, Notechart.eyecatchImage)
      } catch {
        return null
      }
    })
    .task('BackgroundImage', ['Notechart'], async ({ Notechart }) => {
      try {
        if (spec.backImageUrl) {
          const [base, filename] = resolveRelativeResources(
            assets,
            spec.backImageUrl
          )
          return await loadImage(base, filename)
        }
        return await loadImage(assets, Notechart.backgroundImage)
      } catch {
        return null
      }
    })

  const audioLoadProgress = new Progress()
  const audioDecodeProgress = new Progress()
  return container3
    .pushMessage('_loadAudio', 'Loading audio', audioLoadProgress)
    .pushMessage('_decodeAudio', 'Decoding audio', audioDecodeProgress)
    .task('SamplingMaster', [], async () => new SamplingMaster())
    .task(
      'Video',
      ['Notechart'],
      async (
        _,
        progress
      ): Promise<{ element: HTMLVideoElement; offset: number } | null> => {
        if (!spec.videoUrl) {
          return null
        }
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
      },
      spec.videoUrl ? 'Loading video' : undefined
    )
    .task(
      'Game',
      ['Notechart'],
      async ({ Notechart }) => new Game([Notechart], spec.options)
    )
    .task(
      'GameDisplay',
      ['Game', 'Skin', 'Video', 'BackgroundImage'],
      async ({ Game, Skin, Video, BackgroundImage }) =>
        new GameDisplay({
          game: Game,
          scintillator: Skin,
          backgroundImage: BackgroundImage ?? undefined,
          video: Video,
        })
    )
    .task('Samples', ['SamplingMaster', 'Game'], ({ SamplingMaster, Game }) => {
      keysoundCache.receiveSongId(songId ?? '')
      const samplesLoader = new SamplesLoader(assets, SamplingMaster)
      return samplesLoader.loadFiles(
        Game.samples,
        audioLoadProgress,
        audioDecodeProgress
      )
    })
    .task(
      'GameAudio',
      ['Game', 'Samples', 'SamplingMaster'],
      async ({ Game, Samples, SamplingMaster }) =>
        new GameAudio({
          game: Game,
          samples: Samples,
          master: SamplingMaster,
        })
    )
    .task(
      'GameController',
      ['Game', 'GameDisplay', 'GameAudio'],
      async ({ Game, GameDisplay, GameAudio }) =>
        new GameController({
          game: Game,
          display: GameDisplay,
          audio: GameAudio,
        })
    )
}
