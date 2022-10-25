import { useRef } from 'react'

/**
 * On the first render, synchronously run `action`.
 *
 * @param action
 */
export const useRunOnFirstRender = (action: () => void) => {
  const isInitialized = useRef(false)
  if (!isInitialized.current) {
    isInitialized.current = true
    action()
  }
}
