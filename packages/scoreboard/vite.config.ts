import path from 'node:path'

import { cloudflare } from '@cloudflare/vite-plugin'
import {
  cloudflareTest,
  readD1Migrations,
} from '@cloudflare/vitest-pool-workers'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  if (process.env['TEST']) {
    const migrationsPath = path.join(__dirname, 'migrations')
    const migrations = await readD1Migrations(migrationsPath)

    return {
      plugins: [
        cloudflareTest({
          wrangler: {
            configPath: './wrangler.toml',
          },
          miniflare: {
            bindings: { TEST_MIGRATIONS: migrations },
          },
        }),
      ],
      test: {
        exclude: ['node_modules/', 'dist/'],
        setupFiles: ['./test/apply-migrations.ts'],
      },
    }
  }

  return {
    plugins: [react(), cloudflare()],
    server: {
      // delegated to Hono's CORS middleware
      cors: false,
      port: 8787,
    },
  }
})
