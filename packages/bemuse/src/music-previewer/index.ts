import bgmFile from './default.ogg'
import goSoundFile from './go.ogg'

interface Fader {
  fadeTo(target: number, speed: number): void
}

function createFader(
  audio: HTMLAudioElement,
  initialVolume: number,
  onTargetReached: (volume: number) => void
): Fader {
  let targetVolume = 0
  let currentSpeed = 0
  let requested = false
  let volumeChanged: number
  audio.volume = initialVolume

  function elapsed() {
    return (Date.now() - volumeChanged) / 1000
  }

  function getCurrentVolume() {
    if (targetVolume > initialVolume) {
      return Math.min(targetVolume, initialVolume + elapsed() * currentSpeed)
    }
    if (targetVolume < initialVolume) {
      return Math.max(targetVolume, initialVolume - elapsed() * currentSpeed)
    }
    return targetVolume
  }

  function update() {
    requested = false
    const currentVolume = getCurrentVolume()
    audio.volume = currentVolume
    if (currentVolume === targetVolume) {
      if (onTargetReached) onTargetReached(targetVolume)
    } else {
      if (!requested) {
        requested = true
        requestAnimationFrame(update)
      }
    }
  }

  return {
    fadeTo(target, speed) {
      if (targetVolume !== target || speed !== currentSpeed) {
        initialVolume = getCurrentVolume()
        targetVolume = target
        currentSpeed = speed
        volumeChanged = Date.now()
        update()
      }
    },
  }
}

export class MusicPreviewer {
  private enabled = false
  private currentUrl: string | null = null
  private backgroundLoaded = false
  private backgroundPlayed = false
  private readonly instances: Record<string, PlayInstance> = {}
  private readonly background: HTMLAudioElement
  private readonly goSound: HTMLAudioElement
  private readonly backgroundFader: Fader

  constructor() {
    this.background = new Audio(bgmFile)
    this.background.preload = 'auto'
    this.background.loop = true
    this.background.oncanplaythrough = () => {
      this.backgroundLoaded = true
      this.update()
    }
    this.background.load()

    this.goSound = document.createElement('audio')
    this.goSound.src = goSoundFile
    this.goSound.volume = 0.5
    this.goSound.load()

    this.backgroundFader = createFader(this.background, 0.5, (target) => {
      if (target === 0 && this.backgroundPlayed) {
        this.backgroundPlayed = false
        this.background.pause()
      }
    })
  }

  private update() {
    if (!this.enabled) {
      if (this.backgroundPlayed) {
        this.backgroundFader.fadeTo(0, 100)
        this.backgroundPlayed = false
        this.background.pause()
      }
      for (const key of Object.keys(this.instances)) {
        const instance = this.instances[key]
        instance.destroy()
      }
      return
    }
    let playing = null
    for (const key of Object.keys(this.instances)) {
      const instance = this.instances[key]
      if (key === this.currentUrl) {
        if (instance.loaded) {
          instance.play()
          playing = instance
        }
      } else {
        instance.stop()
      }
    }
    if (playing) {
      this.backgroundFader.fadeTo(0, 1)
    } else {
      this.backgroundFader.fadeTo(0.4, 0.5)
      if (this.backgroundLoaded && !this.backgroundPlayed) {
        this.backgroundPlayed = true
        this.background
          .play()
          .catch(() => console.warn('Cannot play background music'))
      }
    }
  }

  enable() {
    if (this.enabled) return
    this.enabled = true
    this.update()
  }
  disable() {
    if (!this.enabled) return
    this.enabled = false
    this.update()
  }
  go() {
    if (!this.enabled) return
    this.goSound.currentTime = 0
    this.goSound.play().catch(() => console.warn('Cannot play go sound.'))
  }
  preview(songUrl: string) {
    if (this.currentUrl === songUrl) return
    this.currentUrl = songUrl
    if (songUrl && !this.instances[songUrl]) {
      this.instances[songUrl] = this.createInstance(songUrl)
    }
    this.update()
  }

  private createInstance(songUrl: string): PlayInstance {
    const audio = document.createElement('audio')
    audio.src = songUrl
    let played = false

    const fader = createFader(audio, 1, (target) => {
      if (target === 0) {
        audio.pause()
        delete this.instances[songUrl]
        this.update()
      }
    })

    const instance = {
      loaded: false,
      play: () => {
        if (!played) {
          audio
            .play()
            .then(() => {
              played = true
            })
            .catch(() => console.warn('Cannot play', audio.src))
        }
        fader.fadeTo(1, 2)
      },
      stop: () => {
        fader.fadeTo(0, 4)
      },
      destroy: () => {
        audio.pause()
        delete this.instances[songUrl]
        this.update()
      },
    }

    audio.oncanplaythrough = () => {
      instance.loaded = true
      this.update()
    }
    audio.onended = () => {
      delete this.instances[songUrl]
      this.update()
    }
    audio.load()

    return instance
  }
}

interface PlayInstance {
  loaded: boolean
  play(): void
  stop(): void
  destroy(): void
}
