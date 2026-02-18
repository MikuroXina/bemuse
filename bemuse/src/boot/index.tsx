/* eslint import/no-webpack-loader-syntax: off */

// :doc:
//
// Bemuse's **main** entry point.
// We need this file to load as soon as possible, therefore,
// we minimize the amount of third-party dependencies.

import '../ui/fonts.scss'
import '../ui/global.scss'

import query from '../utils/query.js'
import React from 'react'
import Boot from './ui/Boot.js'
import ErrorDialog from './ui/ErrorDialog.js'
import loadModule from './loader.js'
import { createRoot } from 'react-dom/client'

const bootRoot = createRoot(document.getElementById('boot-root')!)

function closeErrorDialog() {
  bootRoot.render(null)
}

window.onerror = function (message, url, line, col, e) {
  bootRoot.render(
    <ErrorDialog
      onClose={closeErrorDialog}
      message={`${message}`}
      err={e}
      url={url}
      line={line}
      col={col}
    />
  )
}

// >>
// The Booting Process
// -------------------
// After the ``boot`` script has been loaded, the main script is scanned
// from the ``mode`` query parameter.

const mode = query.mode || 'app'

import(/* webpackChunkName: 'environment' */ './environment.js')
  .then((_) => {
    if (loadModule[mode]) {
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
      loadModule[mode]()
        .then((loadedModule) => {
          bootRoot.render(<Boot status='Initializing' />)
          return loadedModule.main({ setStatus: Boot.setStatus })
        })
        .then(() => {
          bootRoot.render(<Boot hidden />)
        })
        .catch((err) => {
          console.error(err)
          bootRoot.render(
            <ErrorDialog
              onClose={closeErrorDialog}
              message={`An error occurred while initializing "${mode}"`}
              err={err}
            />
          )
        })
    } else {
      bootRoot.render(
        <ErrorDialog
          onClose={closeErrorDialog}
          message={`Invalid mode: ${mode}`}
        />
      )
    }
  })
  .catch((err) => {
    bootRoot.render(
      <ErrorDialog
        onClose={closeErrorDialog}
        message={
          'Failed to load environment bundle. Please refresh the page to try again. ' +
          'If that does not work, try holding down the Shift key while clicking Refresh. ' +
          'If that still does not work, please report this issue to the developers at ' +
          'https://github.com/bemusic/bemuse/issues'
        }
        err={err}
      />
    )
    console.error('An error occurred while loading the component', err)
  })
