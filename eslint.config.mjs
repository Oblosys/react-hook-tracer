import typescriptEslint from 'typescript-eslint'

import eslint from '@eslint/js'
import configPrettier from 'eslint-config-prettier'
import pluginImport from 'eslint-plugin-import'
import pluginJest from 'eslint-plugin-jest'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'

// @ts-check

// Docs: https://eslint.org/docs/latest/use/configure/configuration-files
// Use `yarn  lint-check --inspect-config` to launch web-based config inspector.
export default typescriptEslint.config([
  {
    name: 'global-ignores',
    ignores: [
      // - Implicitly contains '**/node_modules/' & '**/.git/.'
      // - Does not take .gitignore into account
      // - Paths are relative to project root (location of this config file)
      'apps/*/build/',
      'packages/*/dist/',
      '.yarn/',
      '.pnp.*',
      '**/.history/',
    ],
  },
  eslint.configs.recommended,
  typescriptEslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    // Disable type-aware linting for non-TypeScript files.
    name: 'disable-type-aware-linting',
    files: ['**/*.{js,cjs,mjs}'],
    extends: [typescriptEslint.configs.disableTypeChecked],
  },
  pluginImport.flatConfigs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReactHooks.configs['recommended-latest'],
  {
    name: 'custom-rules',
    languageOptions: { globals: pluginJest.environments.globals.globals },
    settings: { react: { version: 'detect' } },
    rules: {
      'arrow-body-style': ['warn', 'as-needed'],
      curly: ['warn', 'all'],
      eqeqeq: ['warn', 'always'],
      'no-console': 'warn',
      'sort-imports': ['warn', { ignoreDeclarationSort: true }],

      // Plugin '@typescript-eslint/' rules:

      '@typescript-eslint/no-empty-function': 'off',

      'no-unused-vars': 'off', // Needs to be off, see https://typescript-eslint.io/rules/no-unused-vars/#how-to-use
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Plugin 'import/' rules:

      'import/no-unresolved': 'off', // handled by TypeScript
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

      // Plugin 'react/' rules:

      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    // Jest linting is only needed for test files.
    name: 'jest',
    files: ['**/test/**/*.*', '**/*.test.*'],
    ...pluginJest.configs['flat/recommended'],
    rules: {
      ...pluginJest.configs['flat/recommended'].rules,
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'warn',
    },
  },
  configPrettier, // Must be last to properly override other configs
])
