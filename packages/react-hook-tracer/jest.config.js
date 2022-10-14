/* eslint-disable no-undef */
'use strict'

// @ts-check
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }] },
  testRegex: './src/.+\\.test\\.tsx?$',
  collectCoverage: false,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/src/__mocks__/cssMock.ts',
  },
}
