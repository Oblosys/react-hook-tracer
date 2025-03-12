// @ts-check
/* eslint-disable no-undef */
'use strict'

/** @type {import('jest').Config} */
const initialOptions = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  roots: ['<rootDir>/src'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }] },
  testRegex: './src/.+\\.test\\.tsx?$',
  collectCoverage: false,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/src/__mocks__/cssMock.ts',
  },
}

module.exports = initialOptions
