// :doc:
//
// Bemuse's **main** entry point.
// We need this file to load as soon as possible, therefore,
// we minimize the amount of third-party dependencies.

import '../ui/fonts.scss'
import '../ui/global.scss'

import attachFastClick from 'fastclick'
import { createRoot } from 'react-dom/client'

import query from '../utils/query.js'
import loadModule, { Module } from './loader.js'
import Boot from './ui/Boot.js'
import ErrorDialog from './ui/ErrorDialog.js'

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      boot().catch(console.error)
    },
    false
  )
} else {
  await boot()
}

async function boot() {
  attachFastClick(document.body)

  const bootRoot = createRoot(document.getElementById('boot-root')!)

  function closeErrorDialog() {
    bootRoot.render(null)
  }

  window.addEventListener('vite:preloadError', (event) => {
    console.error(event.payload)
    bootRoot.render(
      <ErrorDialog
        onClose={closeErrorDialog}
        message={`${event.payload.message}`}
        err={event.payload}
      />
    )
  })
  window.addEventListener('error', (event) => {
    console.error(event.error)
    bootRoot.render(
      <ErrorDialog
        onClose={closeErrorDialog}
        message={`${event.message}`}
        err={event.error}
        url={event.filename}
        line={event.lineno}
        col={event.colno}
      />
    )
  })

  // >>
  // The Booting Process
  // -------------------
  // After the ``boot`` script has been loaded, the main script is scanned
  // from the ``mode`` query parameter.

  const mode = query.mode || 'app'
  const selected: (() => Promise<Module>) | undefined = (
    loadModule as Record<string, () => Promise<Module>>
  )[mode]

  try {
    if (selected) {
      // >>
      // The main script is then loaded and imported into the environment,
      // and its ``main()`` method is invoked.
      //
      // Available Modes
      // ~~~~~~~~~~~~~~~
      // The available modes are specified in :src:`boot/loader.js`.
      //
      // .. codedoc:: boot/modes
      //
      bootRoot.render(<Boot status={`Loading ${mode} bundle`} />)
      try {
        const loadedModule = await selected()
        bootRoot.render(<Boot status='Initializing' />)
        await loadedModule.main({
          setStatus: (status: string) => {
            bootRoot.render(<Boot status={status} />)
          },
        })
        bootRoot.render(<Boot hidden />)
      } catch (err: unknown) {
        console.error(err)
        bootRoot.render(
          <ErrorDialog
            onClose={closeErrorDialog}
            message={`An error occurred while initializing "${mode}"`}
            err={err instanceof Error ? err : undefined}
          />
        )
      }
    } else {
      bootRoot.render(
        <ErrorDialog
          onClose={closeErrorDialog}
          message={`Invalid mode: ${mode}`}
        />
      )
    }
  } catch (err: unknown) {
    bootRoot.render(
      <ErrorDialog
        onClose={closeErrorDialog}
        message={
          'Failed to load environment bundle. Please refresh the page to try again. ' +
          'If that does not work, try holding down the Shift key while clicking Refresh. ' +
          'If that still does not work, please report this issue to the developers at ' +
          'https://github.com/bemusic/bemuse/issues'
        }
        err={err instanceof Error ? err : undefined}
      />
    )
    console.error('An error occurred while loading the component', err)
  }
}
