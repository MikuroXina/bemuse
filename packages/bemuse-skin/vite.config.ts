import { defineConfig } from 'vite'
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    libAssetsPlugin({
      name: '[name]-[contenthash:8].[ext]',
    }),
    dts(),
  ],
  assetsInclude: ['**/*.png', '**/*.fnt'],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.tsx'),
      name: '@mikuroxina/bemuse-skin',
      fileName: 'bemuse-skin',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
        },
      },
    },
  },
})
