import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import _import from 'eslint-plugin-import'
import jest from 'eslint-plugin-jest'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  { ignores: ['apps/*/build/', 'packages/*/dist/'] },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:jest/recommended',
      'plugin:jest/style',
      'plugin:react/jsx-runtime',
      'plugin:react-hooks/recommended',
      'prettier',
    ),
  ),
  {
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import),
      jest: fixupPluginRules(jest),
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
    },

    languageOptions: {
      globals: { ...globals.browser },

      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',

      parserOptions: { ecmaFeatures: { jsx: true } },
    },

    settings: { react: { version: 'detect' } },

    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'warn',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      'arrow-body-style': ['warn', 'as-needed'],
      curly: ['warn', 'all'],
      eqeqeq: ['warn', 'always'],

      'import/order': [
        'warn',
        {
          groups: [
            ['builtin', 'external'],
            ['internal'],
            ['parent'],
            ['sibling', 'index'],
            ['object', 'type'],
            ['unknown'],
          ],

          'newlines-between': 'always',
          warnOnUnassignedImports: true,

          alphabetize: { order: 'asc' },

          pathGroups: [
            {
              pattern: '?(react|react-dom|react-dom/client)',
              group: 'builtin',
              position: 'before',
            },
            { pattern: './*.css', group: 'unknown', position: 'after' },
          ],

          pathGroupsExcludedImportTypes: ['react', 'react-dom'],
        },
      ],

      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'warn',
      'jest/no-identical-title': 'warn',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'warn',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',

      'sort-imports': ['warn', { ignoreDeclarationSort: true }],
    },
  },
]
