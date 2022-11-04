import '@testing-library/jest-dom/extend-expect'
import { cleanup } from '@testing-library/react'

import { clearLog } from '../Tracer'
import { resetComponentRegistry } from '../componentRegistry'

jest.useFakeTimers()

afterEach(() => {
  cleanup()
  jest.runAllTimers()
  resetComponentRegistry()
  clearLog()
})
