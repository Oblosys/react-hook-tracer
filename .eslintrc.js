/* eslint-disable no-undef */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['@typescript-eslint', 'import', 'jest', 'react', 'react-hooks'],
  rules: {
    'no-unused-vars': 'off', // Needs to be disabled: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-vars.md#how-to-use
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'arrow-body-style': ['warn', 'as-needed'],
    'import/order': [
      'warn',
      {
        groups: [
          ['builtin', 'external'],
          ['internal'],
          ['parent', 'sibling', 'index'],
          ['object', 'type'],
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
        // Put 'react' & 'react-dom' in a separate group above the rest:
        pathGroups: [
          {
            pattern: '?(react|react-dom|react-dom/client)',
            group: 'builtin',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react', 'react-dom'],
      },
    ],
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'warn',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'warn',
    'react/display-name': 'off', // Triggers incorrectly, and is about obsolete createReactClass anyway.
    'sort-imports': ['warn', { ignoreDeclarationSort: true }], // `import {B, A} from ..` ~> `import {A, B} from ..`
  },
}
