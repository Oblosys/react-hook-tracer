import { useEffect, useState } from 'react'

import * as hookUtil from '../hooks/hookUtil'

import './StrictModeWarning.css'

export const StrictModeWarning = (): JSX.Element => {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    setIsInitialized(true)
  }, [])

  const strictMode = hookUtil.useStrictModeDetector()

  // Setting data-strict-mode is delayed until after initialization effect to avoid SSR hydration mismatch.
  return (
    <div className="strict-mode-warning" data-strict-mode={isInitialized && strictMode}>
      Warning: React.StictMode is active, trace log will not be accurate. (
      <a
        href="https://github.com/Oblosys/react-hook-tracer#react-strict-mode"
        target="_blank"
        rel="noopener noreferrer"
      >
        info
      </a>
      )
    </div>
  )
}
