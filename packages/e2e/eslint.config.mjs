import bemuseConfig from '@mikuroxina/eslint-config-bemuse'

export default [
  ...bemuseConfig,
  {
    ignores: ['playwright-report/', '.wireit/'],
  },
  {
    rules: {
      'n/no-unsupported-features/node-builtins': 'off',
    },
  },
]
