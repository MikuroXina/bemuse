import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import peggy from 'rollup-plugin-peggy'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tsconfigPaths from 'vite-tsconfig-paths'

function gitRevision() {
  return execSync('git rev-parse --short HEAD').toString().trim()
}

function buildInfo() {
  const file = fileURLToPath(new URL('package.json', import.meta.url))
  const pkgJson = JSON.parse(readFileSync(file, 'utf-8'))
  let name = 'Bemuse MX'
  let version = pkgJson.version

  if (process.env.CONTEXT === 'deploy-preview') {
    name += 'DevMode'
    if (process.env.DEPLOY_PRIME_URL) {
      const m = process.env.DEPLOY_PRIME_URL.match(/\/\/(.*?)--/)
      version += `[${m[1]}]`
    }
    version += '@' + gitRevision()
  } else if (process.env.CONTEXT === 'production') {
    name += 'DevMode'
    version += '+next[staging]@' + gitRevision()
  } else if (!process.env.CI) {
    name += 'DevMode'
    version += '+local'
  }
  return { name, version }
}

const { name, version } = buildInfo()

// @ts-check
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    {
      ...nodePolyfills({
        include: [
          'buffer',
          'crypto',
          'fs',
          'os',
          'path',
          'stream',
          'util',
          'vm',
        ],
        globals: {
          process: true,
        },
        protocolImports: true,
      }),
      resolveId(source) {
        const m =
          /^vite-plugin-node-polyfills\/shims\/(buffer|global|process)$/.exec(
            source
          )
        if (m) {
          return `node_modules/vite-plugin-node-polyfills/shims/${m[1]}/dist/index.cjs`
        }
      },
    },
    peggy(),
    react(),
  ],
  appType: 'mpa',
  base: './',
  define: {
    _BEMUSE_BUILD_NAME: JSON.stringify(name),
    _BEMUSE_BUILD_VERSION: JSON.stringify(version),
  },
  resolve: {
    alias: [
      {
        find: '@bemuse',
        replacement: resolve(__dirname, './src'),
      },
      {
        find: /^(vite-plugin-node-polyfills\/shims\/.+)/,
        replacement: '$1',
        customResolver(source) {
          return import.meta.resolve(source).replace(/^file:\/\//, '')
        },
      },
    ],
  },
  assetsInclude: ['../CHANGELOG.md', './public/**/*'],
  worker: {
    format: 'es',
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
    include: [
      'lodash.uniq',
      'chardet',
      'iconv-lite',
      'bemuse-indexer',
      'react',
      'node:util',
      'vite-plugin-node-polyfills/shims/buffer',
      'vite-plugin-node-polyfills/shims/global',
      'vite-plugin-node-polyfills/shims/process',
    ],
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
})
