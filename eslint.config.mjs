import typescriptEslint from 'typescript-eslint'

import eslint from '@eslint/js'
import configPrettier from 'eslint-config-prettier'
import pluginImport from 'eslint-plugin-import'
import pluginJest from 'eslint-plugin-jest'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'

// @ts-check

// Docs: https://eslint.org/docs/latest/use/configure/configuration-files
// Use `yarn lint-check --inspect-config` to launch web-based config inspector.

export default typescriptEslint.config([
  {
    name: 'global-ignores',
    ignores: [
      // - Implicitly contains '**/node_modules/' & '**/.git/.'.
      // - Does not take .gitignore into account.
      // - Paths are relative to project root (location of this config file).
      'apps/*/build/',
      'packages/*/dist/',
      '.yarn/',
      '.pnp.*',
      '**/.history/',
    ],
  },

  //
  // Core ESLint
  //
  eslint.configs.recommended,
  {
    name: 'core-rules',
    rules: {
      'arrow-body-style': ['warn', 'as-needed'],
      curly: ['warn', 'all'],
      eqeqeq: ['warn', 'always'],
      'no-console': 'warn',
      'sort-imports': ['warn', { ignoreDeclarationSort: true }],
      'no-unused-vars': 'off', // Turned off in favor of TypeScript-specific version
    },
    settings: { react: { version: 'detect' } },
    languageOptions: { globals: pluginJest.environments.globals.globals },
  },

  //
  // TypeScript
  //
  typescriptEslint.configs.recommendedTypeChecked,
  {
    name: 'typescript-rules',
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    // Disable type-aware linting for non-TypeScript files.
    name: 'disable-type-aware-linting',
    files: ['**/*.{js,cjs,mjs}'],
    extends: [typescriptEslint.configs.disableTypeChecked],
  },

  //
  // Import-plugin
  //
  pluginImport.flatConfigs.recommended,
  {
    name: 'import-rules',
    rules: {
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
    },
  },

  //
  // React
  //
  pluginReact.configs.flat.recommended,
  pluginReactHooks.configs['recommended-latest'],
  {
    name: 'react-rules',
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },

  //
  // Jest
  //
  {
    name: 'jest-rules',
    files: ['**/test/**/*.*', '**/*.test.*'],
    extends: [pluginJest.configs['flat/recommended']],
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'warn',
    },
  },

  //
  // Prettier
  //
  // Must be last to properly override other configs. Turns off rules that are handled by or conflict with prettier.
  configPrettier,
])
