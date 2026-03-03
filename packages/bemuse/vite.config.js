import { execSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

function gitRevision() {
  return execSync('git rev-parse --short HEAD').toString().trim()
}

function buildInfo() {
  let name = 'Bemuse MX'
  let version = ''

  if (process.env.CONTEXT === 'deploy-preview') {
    name += ' DevMode'
    if (process.env.DEPLOY_PRIME_URL) {
      const m = process.env.DEPLOY_PRIME_URL.match(/\/\/(.*?)--/)
      version += `[${m[1]}]`
    }
    version += '@' + gitRevision()
  } else if (process.env.CONTEXT === 'production') {
    name += ' DevMode'
    version += '+next[staging]@' + gitRevision()
  } else if (!process.env.CI) {
    name += ' DevMode'
    version += '+local'
  }
  return { name, version }
}

const { name, version } = buildInfo()

const require = createRequire(import.meta.url)
const commonPlugins = [
  nodePolyfills({
    include: ['buffer', 'crypto', 'fs', 'os', 'path', 'stream', 'util', 'vm'],
    globals: {
      process: true,
    },
    protocolImports: true,
  }),
  {
    name: 'vite-plugin-node-polyfills:shims-resolver',
    resolveId(source) {
      const res =
        /^vite-plugin-node-polyfills\/shims\/(?<shim>buffer|global|process)/.exec(
          source
        )
      if (res && res.groups) {
        const { shim } = res.groups
        const id = require
          .resolve(`vite-plugin-node-polyfills/shims/${shim}`)
          .replace('file://', '')
        return {
          id,
          external: false,
        }
      }
      return null
    },
  },
]

// @ts-check
export default defineConfig({
  plugins: [
    ...commonPlugins,
    tsconfigPaths(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        navigateFallbackDenylist: [/^\/project\//],
      },
    }),
  ],
  appType: 'mpa',
  base: '/',
  mode: 'production',
  define: {
    _BEMUSE_BUILD_NAME: JSON.stringify(name),
    _BEMUSE_BUILD_VERSION: JSON.stringify(version),
  },
  resolve: {
    alias: [
      {
        find: '@bemuse',
        replacement: resolve(import.meta.dirname, './src'),
      },
    ],
  },
  assetsInclude: ['../CHANGELOG.md', './public/**/*'],
  worker: {
    format: 'es',
    plugins: () => commonPlugins,
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
    dynamicImportVarsOptions: {
      errorWhenNoFilesFound: true,
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
      '@mikuroxina/bemuse-indexer',
      'fastclick',
      'node:util',
      'redux',
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
