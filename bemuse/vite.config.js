import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { compile } from 'pug'
import peggy from 'rollup-plugin-peggy'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'

function gitRevision() {
  return require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString()
    .trim()
}

function buildInfo() {
  const file = fileURLToPath(new URL('package.json', import.meta.url))
  const pkgJson = JSON.parse(readFileSync(file, 'utf-8'))
  let name = 'Bemuse'
  let version = pkgJson.version.replace(/\.0$/, '').replace(/\.0$/, '')

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
      // based on https://stackoverflow.com/a/69035377/9067735
      name: 'vite-plugin-pug',
      transform(src, id) {
        if (id.endsWith('.pug') || id.endsWith('.jade')) {
          const render = compile(src, { filename: id })
          const html = render()
          let code = ''

          for (const dep of render.dependencies) {
            code += `import ${JSON.stringify(dep)};\n`
          }
          code += `export default ${JSON.stringify(html)};`

          return { code }
        }
      },
    },
    peggy(),
    react(),
  ],
  define: {
    BEMUSE_BUILD_VERSION: JSON.stringify(version),
    BEMUSE_BUILD_NAME: JSON.stringify(name),
  },
  resolve: {
    alias: {
      '@bemuse': resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['../CHANGELOG.md'],
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
