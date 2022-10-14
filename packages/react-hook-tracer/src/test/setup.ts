import '@testing-library/jest-dom/extend-expect'
import { cleanup } from '@testing-library/react'

import { resetNextComponentIds } from '../componentRegistry'

afterEach(() => {
  cleanup()
  resetNextComponentIds()
})
