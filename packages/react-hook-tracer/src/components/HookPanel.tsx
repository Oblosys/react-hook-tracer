import { useEffect, useState } from 'react'

import { tracer } from '../Tracer'
import { LogEntry, TraceOrigin, TraceOrigins } from '../types'

import './HookPanel.css'

interface HookPanelProps {
  label: string
  traceOrigins: TraceOrigins
}
export const HookPanel = ({ label, traceOrigins }: HookPanelProps) => {
  const [selectedLogEntry, setSelectedLogEntry] = useState<LogEntry | null>(null)

  useEffect(() => {
    const listenerId = tracer.subscribeSelectedEntry((value) =>
      setSelectedLogEntry(value?.entry ?? null),
    )
    tracer.registerTracedComponentLabel(label)
    return () => {
      tracer.unregisterTracedComponentLabel(label)
      tracer.unsubscribeSelectedEntry(listenerId)
    }
  }, [label])

  const { mount, render, trace, unmount, hooks } = traceOrigins
  const traceOriginList: TraceOrigin[] = [mount, render, ...hooks, trace, unmount]

  return (
    <div className="hook-panel" data-testid="hook-panel">
      <div className="hook-panel-inner">
        <div className="component-label">{label}</div>
        {traceOriginList.map((origin, index) => (
          <TraceOriginEntry
            key={index}
            traceOrigin={origin}
            isHighlighted={origin === selectedLogEntry?.origin}
          />
        ))}
      </div>
    </div>
  )
}

interface TraceOriginEntryProps {
  traceOrigin: TraceOrigin
  isHighlighted: boolean
}
const TraceOriginEntry = ({ traceOrigin, isHighlighted }: TraceOriginEntryProps) => (
  <div className="trace-origin" data-is-highlighted={isHighlighted}>
    {traceOrigin.originType + (traceOrigin.info !== null ? ' ' + traceOrigin.info : '')}
  </div>
)
