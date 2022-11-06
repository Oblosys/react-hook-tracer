import * as hookUtil from '../hooks/hookUtil'

import './StrictModeWarning.css'

export const StrictModeWarning = (): JSX.Element => {
  const strictMode = hookUtil.useStrictModeDetector()

  return (
    <div className="strict-mode-warning" data-strict-mode={strictMode}>
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
