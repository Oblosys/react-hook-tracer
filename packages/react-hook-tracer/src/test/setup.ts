import '@testing-library/jest-dom/extend-expect'
import { cleanup } from '@testing-library/react'
import failOnConsole from 'jest-fail-on-console'

import { clearLog } from '../Tracer'
import { resetComponentRegistry } from '../componentRegistry'

failOnConsole()

jest.useFakeTimers()

afterEach(() => {
  cleanup()
  jest.runAllTimers()
  resetComponentRegistry()
  clearLog()
})
