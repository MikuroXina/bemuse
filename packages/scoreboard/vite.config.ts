import path from 'node:path'

import { cloudflare } from '@cloudflare/vite-plugin'
import {
  cloudflareTest,
  readD1Migrations,
} from '@cloudflare/vitest-pool-workers'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  const migrationsPath = path.join(__dirname, 'migrations')
  const migrations = await readD1Migrations(migrationsPath)

  return {
    plugins: [
      react(),
      cloudflare(),
      cloudflareTest({
        miniflare: {
          bindings: { TEST_MIGRATIONS: migrations },
        },
      }),
    ],
    server: {
      // delegated to Hono's CORS middleware
      cors: false,
      port: 8787,
    },
    test: {
      exclude: ['node_modules/', 'dist/'],
      setupFiles: ['./test/apply-migrations.ts'],
    },
  }
})
