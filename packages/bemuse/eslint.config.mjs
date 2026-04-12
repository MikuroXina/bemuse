import bemuseConfig from '@mikuroxina/eslint-config-bemuse'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [
  ...bemuseConfig,
  ...pluginQuery.configs['flat/recommended'],
  {
    ignores: ['dev-dist/'],
  },
  {
    rules: {
      'n/no-unsupported-features/node-builtins': 'off',
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@tanstack/query/exhaustive-deps': [
        'error',
        {
          allowlist: {
            variables: ['service'],
            types: ['RankingService'],
          },
        },
      ],
    },
  },
]
