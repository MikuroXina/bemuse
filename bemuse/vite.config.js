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
    peggy(),
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'os', 'path', 'stream', 'util', 'vm'],
      globals: {
        Buffer: true,
      },
    }),
  ],
  appType: 'mpa',
  base: './',
  define: {
    _BEMUSE_BUILD_NAME: JSON.stringify(name),
    _BEMUSE_BUILD_VERSION: JSON.stringify(version),
  },
  resolve: {
    alias: {
      '@bemuse': resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['../CHANGELOG.md', '../public/**/*'],
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
    include: [
      'bemuse-indexer',
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
