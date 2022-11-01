import React, { useCallback, useRef } from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import { TracePanel } from '../components/TracePanel'
import * as reactInternals from '../reactInternals'
import { ShowProps } from '../types'
import * as util from '../util'

export interface UseTracerOptions {
  showProps?: ShowProps
}
export interface UseTracer {
  componentLabel: string
  trace: (message: string) => void
  TracePanel: () => JSX.Element
}

const mkShowPropValue: (showProps?: ShowProps) => (propKey: string, propValue: unknown) => string =
  (showProps) => (propKey, propValue) => {
    if (showProps !== undefined && propKey in showProps) {
      const showProp = showProps[propKey]
      if (showProp !== undefined) {
        return showProp(propValue)
      }
    }
    return util.showPropValue(propKey, propValue)
  }

export const useTracer = (options?: UseTracerOptions): UseTracer => {
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

  // Effect with empty dependencies to track component unmount on cleanup.
  React.useEffect(
    () => () => {
      tracer.trace(componentLabel, componentInfo.traceOrigins.unmount)
    },
    [componentLabel, componentInfo.traceOrigins.mount, componentInfo.traceOrigins.unmount],
  )

  const pendingProps = reactInternals.getCurrentPendingProps()

  const propsStr = util.showProps(pendingProps, showPropValue)
  tracer.trace(componentLabel, componentInfo.traceOrigins.render, undefined, propsStr) // Emit trace that component is rendering.

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
  return { componentLabel, trace, TracePanel: WrappedTracePanel }
}
