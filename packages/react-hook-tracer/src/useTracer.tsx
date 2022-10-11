import React, { useCallback, useRef } from 'react'

import { tracer } from './Tracer'
import * as componentRegistry from './componentRegistry'
import { HookPanel } from './components/HookPanel'

interface UseTracer {
  label: string
  trace: (message: string) => void
  HookPanel: () => JSX.Element
}
export const useTracer = (): UseTracer => {
  const componentInfo = componentRegistry.registerCurrentComponent()
  const label = componentInfo.label

  const isInitialized = useRef(false)

  if (!isInitialized.current) {
    isInitialized.current = true
    tracer.trace(label, componentInfo.traceOrigins.mount)
  }

  tracer.trace(label, componentInfo.traceOrigins.render)

  // Effect with empty dependencies to track component unmount
  React.useEffect(
    () => () => {
      tracer.trace(label, componentInfo.traceOrigins.unmount)
    },
    [label, componentInfo.traceOrigins.unmount], // TODO: Maybe just ignore? Don't change anyway.
  )

  const trace = useCallback(
    (message: string) => tracer.trace(label, componentInfo.traceOrigins.trace, message),
    [label, componentInfo.traceOrigins.trace],
  )

  // useCallback guarantees stable component (as label & componentInfo.traceOrigins won't change).
  // Note that WrappedHookPanel is not (and shouldn't be) memoized as traceOrigins is mutable.
  const WrappedHookPanel = useCallback(
    () => <HookPanel label={label} traceOrigins={componentInfo.traceOrigins} />,
    [label, componentInfo.traceOrigins],
  )

  return { label, trace, HookPanel: WrappedHookPanel }
}
