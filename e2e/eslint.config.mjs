import bemuseConfig from 'eslint-config-bemuse'

export default [
  ...bemuseConfig,
  {
    rules: {
      'n/no-unsupported-features/node-builtins': 'off',
    },
  },
]
