import { resolve } from 'node:path'

import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    libAssetsPlugin({
      name: '[folder]/[name].[ext]',
      include: [/\.png(\?.*)?$/, /\.fnt(\?.*)?$/],
    }),
    dts({
      insertTypesEntry: true,
    }),
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
