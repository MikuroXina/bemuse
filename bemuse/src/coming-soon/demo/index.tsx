import './style.scss'

import ctx from '@bemuse/audio-context/index.js'
import DndResources from '@bemuse/resources/dnd-resources.js'
import SamplingMaster, { Sample } from '@bemuse/sampling-master/index.js'
import { BMSChart, Compiler, Notes, Reader, SongInfo, Timing } from 'bms'
import { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

interface PlayContext {
  timing: Timing
  loadedSamples: Record<string, Sample | null>
  master: SamplingMaster
  notes: Notes
}

export function main(element: Element) {
  const root = createRoot(element)

  const Splash = () => {
    return (
      <span
        onClick={() => {
          root.render(<UI />)
        }}
      >
        Technical Demo!
      </span>
    )
  }
  root.render(<Splash />)
}

function UI() {
  const [isReadyToPlay, setIsReadyToPlay] = useState(false)
  const [logText, setLogText] = useState('Waiting for BMS file...')
  const samplerRef = useRef<HTMLDivElement>(null)
  const playContextRef = useRef<PlayContext | null>(null)

  return (
    <div
      className='jukebox'
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDrop={(e) => {
        e.preventDefault()
        if (!samplerRef.current) {
          return
        }
        const dndLoader = new DndResources(e.nativeEvent)
        loadPlayContext(dndLoader, setLogText, samplerRef.current).then(
          (ctx) => {
            playContextRef.current = ctx
            setIsReadyToPlay(true)
          }
        )
      }}
    >
      <div className='jukebox--overlay' />
      <div className='jukebox--inner'>
        <h1>BMS Jukebox</h1>
        <p className='jukebox--status js-log'>{logText}</p>
        <p>Google Chrome: Drag a BMS folder into this box.</p>
        <p>
          Firefox, Safari: Select all files (BMS+sounds) and drag into this box.
        </p>
        <button
          className='js-play'
          onClick={() => {
            if (!playContextRef.current || !samplerRef.current) {
              return
            }
            setIsReadyToPlay(false)
            play(playContextRef.current, samplerRef.current)
          }}
          disabled={isReadyToPlay}
        >
          Click Here to Play
        </button>
        <div ref={samplerRef} className='js-sampler jukebox--sampler' />
      </div>
    </div>
  )
}

async function loadPlayContext(
  loader: DndResources,
  log: (message: string) => void,
  sampler: HTMLDivElement
): Promise<PlayContext> {
  const master = new SamplingMaster(ctx)

  log('Loading file list')
  const list = await loader.fileList
  const bmsFile = list.filter((f) => f.match(/\.(?:bms|bme|bml|pms)$/i))[0]
  log('Loading ' + bmsFile)

  const loadedFile = await loader.file(bmsFile)
  const arraybuffer = await loadedFile.read()
  const buffer = Buffer.from(new Uint8Array(arraybuffer))
  const text = await Reader.readAsync(buffer)
  const chart = Compiler.compile(text).chart
  const timing = Timing.fromBMSChart(chart)
  const notes = Notes.fromBMSChart(chart)
  const info = SongInfo.fromBMSChart(chart)
  sampler.innerHTML = `<pre wrap>${JSON.stringify(info, null, 2)}</pre>`
  log('Loading samples')
  const loadedSamples = await loadSamples(notes, chart)
  log('Click the button to play!')

  return { timing, loadedSamples, master, notes }

  async function loadSamples(
    notes: Notes,
    chart: BMSChart
  ): Promise<Record<string, Sample | null>> {
    const samples: Record<string, Sample | null> = {}
    const promises = []
    let completed = 0

    for (const note of notes.all()) {
      const keysound = note.keysound
      if (!(keysound in samples)) {
        samples[keysound] = null
        promises.push(async () => {
          try {
            const blob = await loadKeysound(chart.headers.get('wav' + keysound))
            const sample = await master.sample(blob)
            samples[keysound] = sample
            log('[loaded ' + ++completed + '/' + promises.length + ' samples]')
          } catch (e) {
            console.error('Unable to load ' + keysound + ': ' + e)
          }
        })
      }
    }

    await Promise.all(promises)
    return samples
  }

  function loadKeysound(name: string | undefined) {
    if (typeof name !== 'string') return Promise.reject(new Error('Empty name'))
    return Promise.resolve(loader.file(name))
      .catch(() => loader.file(name.replace(/\.\w+$/, '.ogg')))
      .catch(() => loader.file(name.replace(/\.\w+$/, '.m4a')))
      .catch(() => loader.file(name.replace(/\.\w+$/, '.flac')))
      .catch(() => loader.file(name.replace(/\.\w+$/, '.mp3')))
      .catch(() => loader.file(name.replace(/\.\w+$/, '.wav')))
      .then((file) => file.read())
  }
}

function play(
  { master, loadedSamples, notes, timing }: PlayContext,
  sampler: HTMLDivElement
) {
  master.unmute()
  for (const note of notes.all()) {
    setTimeout(() => {
      const sample = loadedSamples[note.keysound]
      if (!sample) {
        console.log('warn: unknown sample ' + note.keysound)
        return
      }
      sampler.innerHTML = `<span>[${note.keysound}]</span>`
      const instance = sample.play()
      sampler.scrollTop = sampler.scrollHeight
      instance.onstop = function () {
        sampler.children.item(0)?.classList.add('is-off')
      }
    }, timing.beatToSeconds(note.beat) * 1000)
  }
  return false
}
