import '@testing-library/jest-dom/extend-expect'
import { cleanup } from '@testing-library/react'

import { resetNextComponentIds } from '../componentRegistry'

jest.useFakeTimers()

afterEach(() => {
  cleanup()
  jest.runAllTimers()
  resetNextComponentIds()
})
