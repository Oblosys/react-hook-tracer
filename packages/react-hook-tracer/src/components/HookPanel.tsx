import { useEffect, useState } from 'react'

import { LogEntry, tracer } from '../Tracer'
import { HookInfo } from '../types'

import './HookPanel.css'
// TODO: Fix linter rule for css and empty line below imports, and for `const [x, _] = ...`

interface HookPanelProps {
  label: string
  getHookStages: () => HookInfo[] // TODO: HookStages is not a great name.
}
export const HookPanel = ({ label, getHookStages }: HookPanelProps) => {
  const [selectedLogEntry, setSelectedLogEntry] = useState<LogEntry | null>(null)

  useEffect(() => {
    const listenerId = tracer.subscribe({
      setSelectedLogEntry,
    })
    return () => tracer.unsubscribe(listenerId)
  }, [])

  return (
    <div className="hook-panel" data-testid="hook-panel">
      <div className="hook-panel-inner">
        <div className="component-label">{label}</div>
        {getHookStages().map((stage, index) => (
          <HookStage key={index} stage={stage} isHighlighted={stage === selectedLogEntry?.origin} />
        ))}
      </div>
    </div>
  )
}

interface HookStageProps {
  stage: HookInfo
  isHighlighted: boolean
}
const HookStage = ({ stage, isHighlighted }: HookStageProps) => (
  <div className="hook-stage" data-is-highlighted={isHighlighted}>
    {stage.hookType + (stage.info ? ' ' + stage.info : '')}
  </div>
)
