import { reactRouter } from '@react-router/dev/vite'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// @ts-check
export default defineConfig({
  plugins: [tsconfigPaths(), reactRouter()],
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
    dynamicImportVarsOptions: {
      errorWhenNoFilesFound: true,
    },
  },
  optimizeDeps: {
    include: [
      '@ui5/webcomponents-react/ThemeProvider',
      '@ui5/webcomponents-react/ShellBar',
      '@ui5/webcomponents-react/Button',
      '@ui5/webcomponents-icons/activities.js',
      '@ui5/webcomponents-icons/alert.js',
      '@ui5/webcomponents-icons/attachment-audio.js',
      '@ui5/webcomponents-icons/attachment-video.js',
      '@ui5/webcomponents-icons/full-stacked-column-chart.js',
      '@ui5/webcomponents-icons/information.js',
      '@ui5/webcomponents-icons/media-play.js',
      '@ui5/webcomponents-icons/message-success.js',
      '@ui5/webcomponents-icons/synchronize.js',
      '@ui5/webcomponents-react/TabContainer',
      '@ui5/webcomponents-react/Label',
      '@ui5/webcomponents-react/Bar',
      '@ui5/webcomponents-react/IllustratedMessage',
      '@ui5/webcomponents-react/Tab',
      '@ui5/webcomponents-react/List',
      '@ui5/webcomponents-react/Card',
      '@ui5/webcomponents-react/TableHeaderCell',
      '@ui5/webcomponents-react/TableHeaderRow',
      '@ui5/webcomponents-react/TableCell',
      '@ui5/webcomponents-react/TableRow',
      '@ui5/webcomponents-react/Table',
      '@ui5/webcomponents-react/CardHeader',
      '@ui5/webcomponents-react/ListItemStandard',
      '@ui5/webcomponents-react/Select',
      '@ui5/webcomponents-react/Option',
      '@ui5/webcomponents-react/Input',
      '@ui5/webcomponents-react/BusyIndicator',
      'valibot',
      '@ui5/webcomponents-react/TextArea',
      '@ui5/webcomponents-react/DatePicker',
      'memoize-one',
      'spark-md5',
      'markdown-it',
      'lodash/sortBy.js',
      'invariant',
      'object-assign',
      'chardet',
      'lodash.assign',
      'lodash.map',
      'lodash.uniq',
      'lodash.values',
      'data-structure',
    ],
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
})
