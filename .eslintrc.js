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
  ignorePatterns: ['/apps/*/build/', '/packages/*/dist/'],
  root: true, // Prevents eslint from looking for config files in parent directories of project root.
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
        warnOnUnassignedImports: true, // necessary for css imports like `import './Component.css'`
        alphabetize: { order: 'asc' },
        pathGroups: [
          {
            // Put 'react' & 'react-dom' in a separate group in front of the rest:
            pattern: '?(react|react-dom|react-dom/client)',
            group: 'builtin',
            position: 'before',
          },
          {
            // NOTE: ESLint won't change the import order for these on auto-fix (since they are unassigned imports).
            pattern: './*.css',
            group: 'unknown',
            position: 'after',
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
    'react/no-unescaped-entities': 'off', // Not that useful, and makes source less readable.
    'sort-imports': ['warn', { ignoreDeclarationSort: true }], // `import {B, A} from ..` ~> `import {A, B} from ..`
  },
}
