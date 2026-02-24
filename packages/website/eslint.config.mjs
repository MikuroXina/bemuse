import pluginDocusaurus from '@docusaurus/eslint-plugin'
import bemuseConfig from 'eslint-config-bemuse'

export default [
  ...bemuseConfig,
  {
    ignores: ['.docusaurus/'],
  },
  {
    plugins: {
      '@docusaurus': pluginDocusaurus,
    },
    rules: pluginDocusaurus.configs.recommended.rules,
  },
  {
    rules: {
      'n/no-missing-import': 'off',
    },
  },
]
