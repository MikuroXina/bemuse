import bemuseConfig from '@mikuroxina/eslint-config-bemuse'

export default [
  ...bemuseConfig,
  {
    rules: {
      'n/no-missing-import': 'off',
    },
  },
]
