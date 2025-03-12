import React, { useCallback, useRef } from 'react'

import { isTraceLogRegistered, logPendingToConsole, setTracerConfig, tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import { DummyTracePanel, TracePanel } from '../components/TracePanel'
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
  if (util.isProductionBuild || util.isServerRendered) {
    return { trace: (_message: string) => {}, TracePanel: DummyTracePanel }
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useTracerClientSide(options)
  }
}

const useTracerClientSide = (
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
    [componentLabel, componentInfo.traceOrigins.mount], // All stable.
  )

  // Effect with stable dependencies, runs only on first render.
  React.useEffect(() => {
    if (!isTraceLogRegistered()) {
      // Any traces before this point will already have been queued in timeouts, so we need to queue a timeout as well.
      setTimeout(() => {
        // eslint-disable-next-line no-console
        console.log(
          'react-hook-tracer: Since no <TraceLog/> element was rendered, traces will be sent to the console instead.' +
            ' Queued traces so far:',
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
    [componentLabel, componentInfo.traceOrigins.trace], // All stable.
  )

  // Refs to pass props, showPropValue, and traceOrigins to WrappedTracePanel.
  const pendingPropsRef = useRef(pendingProps)
  pendingPropsRef.current = pendingProps
  const showPropValueRef = useRef(showPropValue)
  showPropValueRef.current = showPropValue
  const traceOriginsRef = useRef(componentInfo.traceOrigins)
  traceOriginsRef.current = componentInfo.traceOrigins

  // useCallback guarantees stable component.
  const WrappedTracePanel = useCallback(
    () => (
      <TracePanel
        componentLabel={componentLabel} // Constant
        props={pendingPropsRef.current} // Changes on prop changes, but only happens on component render.
        showPropValue={showPropValueRef.current}
        traceOrigins={traceOriginsRef.current} // Mutable, will contain correct values before TracePanel is rendered.
        refreshTracePanelRef={componentInfo.refreshTracePanelRef} // Mutable, will be set by TracePanel on render.
      />
    ),
    [componentInfo.refreshTracePanelRef, componentLabel], // All stable.
  )

  // NOTE: TracePanel must be used directly inside the rendering of the traced component.
  return { trace, TracePanel: WrappedTracePanel }
}
