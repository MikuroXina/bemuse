import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    devServer({
      injectClientScript: false,
      adapter,
      entry: 'src/main.ts',
    }),
  ],
  build: {
    rollupOptions: {
      input: ['src/client.tsx'],
      output: {
        entryFileNames: 'static/[name].js',
      },
    },
  },
})
