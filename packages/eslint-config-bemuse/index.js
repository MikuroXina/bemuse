import pluginJs from '@eslint/js'
import nodePlugin from 'eslint-plugin-n'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import reactJSXRuntime from 'eslint-plugin-react/configs/jsx-runtime.js'
import reactRecommended from 'eslint-plugin-react/configs/recommended.js'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  {
    ignores: [
      '**/node_modules/**/*',
      '**/vendor/**/*',
      '**/lib/**/*',
      '**/dist/**/*',
      '**/build/**/*',
      '**/coverage/**/*',
      '**/common/scripts/**/*',
      '**/temp/**/*',
      '**/tmp/**/*',
      '**/.yarn/**/*',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
  },
  pluginJs.configs.recommended,
  nodePlugin.configs['flat/recommended-script'],
  ...tseslint.configs.recommended,
  {
    ...reactRecommended,
    ...reactJSXRuntime,
    rules: {
      ...reactRecommended.rules,
      ...reactJSXRuntime.rules,
    },
    languageOptions: {
      ...reactRecommended.languageOptions,
      ...reactJSXRuntime.languageOptions,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'react/prop-types': 'warn',
      'react/jsx-no-bind': 'off',
      'react/jsx-handler-names': 'off',
      'no-mixed-operators': 'off',
      'no-sequences': 'off',
      'import/no-unresolved': 'off',
      'import/export': 'off',
      'import/named': 'off',
      'no-use-before-define': 'off',
      'import/no-webpack-loader-syntax': 'off',
      'no-void': 'off',
      'dot-notation': 'off',
      'object-shorthand': 'off',

      // These should be errors, but we just added them and there are too many
      // violations to fix right now.
      'n/no-deprecated-api': 'warn',
      'react/jsx-key': 'warn',
      'react/no-deprecated': 'warn',
      'react/no-find-dom-node': 'warn',
      'react/no-string-refs': 'warn',
      'no-prototype-builtins': 'warn',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      'no-useless-constructor': 'off',
      'react/prop-types': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      'n/no-unpublished-import': 'off',
    },
  },
  eslintPluginPrettierRecommended,
]
