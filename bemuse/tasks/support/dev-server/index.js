import { readFileSync } from 'node:fs'

import chalk from 'chalk'
import PluginError from 'plugin-error'
import { createServer } from 'vite'

import * as Env from '../../../config/env.js'

const pkgJson = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf-8')
)

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
