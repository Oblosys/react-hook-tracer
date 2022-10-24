import { useEffect, useState } from 'react'

import { tracer } from '../Tracer'
import { LogEntry, TraceOrigin, TraceOrigins } from '../types'
import * as util from '../util'

import './TracePanel.css'

interface TracePanelProps {
  label: string
  props: Record<string, unknown>
  showPropValue: (propKey: string, propValue: unknown) => string
  // NOTE: traceOrigins is stable object that is mutated while rendering (i.e while evaluating function-component body).
  traceOrigins: TraceOrigins
}
export const TracePanel = ({ label, props, showPropValue, traceOrigins }: TracePanelProps) => {
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

  const propKeyValues = util
    .getObjectKeys(props)
    .map((key) => ({ propKey: key, propValue: props[key] }))

  const { mount, render, trace, unmount, hooks } = traceOrigins
  const traceOriginList: TraceOrigin[] = [mount, render, ...hooks, trace, unmount]

  return (
    <div className="trace-panel" data-testid="trace-panel">
      <div className="component-label">
        <div>{label}</div>
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
    <span className="origin-type">
      {traceOrigin.originType + (traceOrigin.info !== null ? ': ' : '')}
    </span>
    <span className="origin-info">{traceOrigin.info ?? ''}</span>
  </div>
)
