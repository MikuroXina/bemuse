import bemuseConfig from '@mikuroxina/eslint-config-bemuse'

export default [
  ...bemuseConfig,
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
    },
  },
]
