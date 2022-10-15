import React, { useCallback, useRef } from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import { HookPanel } from '../components/HookPanel'
import { ShowProps } from '../types'
import * as util from '../util'

export interface UseTracerOptions {
  showProps?: ShowProps
}
export interface UseTracer {
  label: string
  trace: (message: string) => void
  HookPanel: () => JSX.Element
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
  const label = componentInfo.label

  const isInitialized = useRef(false)

  if (!isInitialized.current) {
    isInitialized.current = true
    tracer.trace(label, componentInfo.traceOrigins.mount)
  }

  // Effect with empty dependencies to track component unmount
  React.useEffect(
    () => () => {
      tracer.trace(label, componentInfo.traceOrigins.unmount)
    },
    [label, componentInfo.traceOrigins.unmount], // TODO: Maybe just ignore? Don't change anyway.
  )

  const pendingProps = componentRegistry.getCurrentOwner()?.pendingProps ?? {}

  const propsStr = util.showProps(pendingProps, showPropValue)
  tracer.trace(label, componentInfo.traceOrigins.render, propsStr) // Emit trace that component is rendering.

  const trace = useCallback(
    (message: string) => tracer.trace(label, componentInfo.traceOrigins.trace, message),
    [label, componentInfo.traceOrigins.trace],
  )

  // Refs to pass props and traceOrigins to WrappedHookPanel.
  const pendingPropsRef = useRef(pendingProps)
  pendingPropsRef.current = pendingProps
  const traceOriginsRef = useRef(componentInfo.traceOrigins)
  traceOriginsRef.current = componentInfo.traceOrigins

  // useCallback guarantees stable component that only remounts if user-specified showPropValue changes.
  const WrappedHookPanel = useCallback(
    () => (
      <HookPanel
        label={label} // Constant
        props={pendingPropsRef.current} // Changes on prop changes, but only happens on component render.
        showPropValue={showPropValue}
        traceOrigins={traceOriginsRef.current} // Mutable, will contain correct values before HookPanel is rendered.
      />
    ),
    //
    [label, showPropValue],
  )

  // NOTE: HookPanel must be used directly inside the rendering of the traced component.
  return { label, trace, HookPanel: WrappedHookPanel }
}