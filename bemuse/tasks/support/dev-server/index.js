import chalk from 'chalk'
import PluginError from 'plugin-error'

import * as Env from '../../../config/env.js'
import { createServer } from 'vite'

import pkgJson from '../../../package.json' with { type: 'json' }

export async function start() {
  console.log(
    chalk.redBright('⬤'),
    chalk.yellowBright('▗▚▚▚'),
    chalk.bold('Bemuse MX'),
    chalk.cyan(pkgJson.version)
  )

  const port = Env.serverPort()
  try {
    const server = await createServer()
    await server.listen(port)
    server.printUrls()
    server.bindCLIShortcuts({ print: true })
  } catch (err) {
    throw new PluginError('webpack-dev-server', err)
  }
}
