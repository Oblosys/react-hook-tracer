import { MutableRefObject, useCallback, useEffect, useState } from 'react'

import { tracer } from '../Tracer'
import { LogEntry, TraceOrigin, TraceOrigins } from '../types'
import * as util from '../util'

import './TracePanel.css'

interface TracePanelProps {
  componentLabel: string
  props: Record<string, unknown>
  showPropValue: (propKey: string, propValue: unknown) => string
  // NOTE: traceOrigins is stable object that is mutated while rendering (i.e while evaluating function-component body).
  traceOrigins: TraceOrigins
  refreshTracePanelRef: MutableRefObject<(() => void) | null>
}
export const TracePanel = ({
  componentLabel,
  props,
  showPropValue,
  traceOrigins,
  refreshTracePanelRef,
}: TracePanelProps) => {
  const [selectedLogEntry, setSelectedLogEntry] = useState<LogEntry | null>(null)

  const [, setRefreshDummy] = useState([]) // Dummy state to trigger re-render.

  // Called after ref mutation to update the ref value shown.
  const refreshTracePanel = useCallback(() => {
    // Defer the setting the state with a timeout, as the ref mutation may happen during a render.
    setTimeout(() => setRefreshDummy(() => []), 0)
  }, [])

  refreshTracePanelRef.current = refreshTracePanel

  useEffect(() => {
    const listenerId = tracer.subscribeSelectedEntry((value) =>
      setSelectedLogEntry(value?.entry ?? null),
    )
    tracer.registerTracedComponentLabel(componentLabel)
    return () => {
      tracer.unregisterTracedComponentLabel(componentLabel)
      tracer.unsubscribeSelectedEntry(listenerId)
    }
  }, [componentLabel])

  const propKeyValues = util
    .getObjectKeys(props)
    .map((key) => ({ propKey: key, propValue: props[key] }))

  const { mount, render, trace, hooks } = traceOrigins
  const traceOriginList: TraceOrigin[] = [mount, render, ...hooks, trace]

  return (
    <div className="trace-panel" data-testid="trace-panel">
      <div className="component-label">
        <div>{componentLabel}</div>
      </div>
      {propKeyValues.length > 0 && (
        <div className="props">
          {propKeyValues.map(({ propKey, propValue }) => (
            <Prop
              propKey={propKey}
              propValue={propValue}
              showPropValue={showPropValue}
              key={propKey}
            />
          ))}
        </div>
      )}
      <div className="trace-origins">
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

interface PropProps {
  propKey: string
  propValue: unknown
  showPropValue: (propKey: string, propValue: unknown) => string
}
const Prop = ({ propKey, propValue, showPropValue }: PropProps) => (
  <div data-testid="prop">
    <span className="prop-key">{propKey}</span>=
    <span className="prop-value">{showPropValue(propKey, propValue)}</span>
  </div>
)

interface TraceOriginEntryProps {
  traceOrigin: TraceOrigin
  isHighlighted: boolean
}
const TraceOriginEntry = ({ traceOrigin, isHighlighted }: TraceOriginEntryProps) => (
  <div className="trace-origin" data-is-highlighted={isHighlighted} data-testid="trace-origin">
    <span className="origin-type">{traceOrigin.originType}</span>
    {traceOrigin.label && <span className="origin-label">{`«${traceOrigin.label}»`}</span>}
    {traceOrigin.info && ':'}
    {traceOrigin.info && <span className="origin-info">{traceOrigin.info}</span>}
  </div>
)
