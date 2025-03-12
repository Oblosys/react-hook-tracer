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

export const useStrictModeDetector = (): boolean => {
  const strictModeRef = useRef(false)

  // React v17 mutes the console during the second strict-mode render with a method that has a '__reactDisabledLog' key.
  // React v18 dims the log message with a method that has a '__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__' key.
  if (
    // eslint-disable-next-line no-console
    '__reactDisabledLog' in console.log ||
    // eslint-disable-next-line no-console
    '__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__' in console.log
  ) {
    strictModeRef.current = true
  }
  return strictModeRef.current
}
