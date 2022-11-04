import React, { useCallback, useRef } from 'react'

import { isTraceLogRegistered, logPendingToConsole, setTracerConfig, tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import { TracePanel } from '../components/TracePanel'
import * as reactInternals from '../reactInternals'
import { ShowProps } from '../types'
import * as util from '../util'

export interface UseTracerOptions {
  showProps?: ShowProps
}

const mkShowPropValue: (showProps?: ShowProps) => (propKey: string, propValue: unknown) => string =
  (showProps) => (propKey, propValue) => {
    if (showProps !== undefined && propKey in showProps) {
      const showProp = showProps[propKey]
      if (showProp !== undefined) {
        return showProp(propValue)
      }
    }
    return util.showValue(propValue)
  }

export const useTracer = (
  options?: UseTracerOptions,
): {
  trace: (message: string) => void
  TracePanel: () => JSX.Element
} => {
  const showPropValue = mkShowPropValue(options?.showProps)
  const componentInfo = componentRegistry.registerCurrentComponent()
  const componentLabel = componentInfo.componentLabel

  const isInitialized = useRef(false)

  if (!isInitialized.current) {
    isInitialized.current = true
    tracer.trace(componentLabel, componentInfo.traceOrigins.mount, 'mounting')
  }

  // UseLayoutEffect is the most appropriate hook to report when a component has mounted.
  // (See https://reactjs.org/docs/hooks-reference.html#uselayouteffect)
  React.useLayoutEffect(
    () => {
      tracer.trace(componentLabel, componentInfo.traceOrigins.mount, 'mounted')
    },
    [componentLabel, componentInfo.traceOrigins.mount], // TODO: Maybe just ignore? Don't change anyway.
  )

  // Effect with stable dependencies, runs only on first render.
  React.useEffect(() => {
    if (!isTraceLogRegistered()) {
      // Any traces before this point will already have been queued in timeouts, so we need to queue a timeout as well.
      setTimeout(() => {
        console.log(
          'react-hook-tracer: No TraceLog component found, tracing to the console instead.',
        )
        logPendingToConsole()
        setTracerConfig({ traceToConsole: true })
      }, 0)
    }
    return () => {
      tracer.trace(componentLabel, componentInfo.traceOrigins.unmount)
    }
  }, [componentLabel, componentInfo.traceOrigins.mount, componentInfo.traceOrigins.unmount]) // All stable.

  const pendingProps = { ...reactInternals.getCurrentPendingProps() } // Should be immutable, but let's make sure.

  const show = (props: Record<string, unknown>) => util.showProps(props, showPropValue)
  const messageOrObject = { value: pendingProps, show }

  // Emit trace that component is rendering.
  tracer.trace(componentLabel, componentInfo.traceOrigins.render, 'props', messageOrObject)

  const trace = useCallback(
    (message: string) =>
      tracer.trace(componentLabel, componentInfo.traceOrigins.trace, undefined, message),
    [componentLabel, componentInfo.traceOrigins.trace],
  )

  // Refs to pass props and traceOrigins to WrappedTracePanel.
  const pendingPropsRef = useRef(pendingProps)
  pendingPropsRef.current = pendingProps
  const traceOriginsRef = useRef(componentInfo.traceOrigins)
  traceOriginsRef.current = componentInfo.traceOrigins

  // useCallback guarantees stable component that only remounts if user-specified showPropValue changes.
  const WrappedTracePanel = useCallback(
    () => (
      <TracePanel
        componentLabel={componentLabel} // Constant
        props={pendingPropsRef.current} // Changes on prop changes, but only happens on component render.
        showPropValue={showPropValue}
        traceOrigins={traceOriginsRef.current} // Mutable, will contain correct values before TracePanel is rendered.
        refreshTracePanelRef={componentInfo.refreshTracePanelRef} // Mutable, will be set by TracePanel on render.
      />
    ),
    //
    [componentInfo, componentLabel, showPropValue],
  )

  // NOTE: TracePanel must be used directly inside the rendering of the traced component.
  return { trace, TracePanel: WrappedTracePanel }
}
