import React, { useRef } from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import * as util from '../util'

export interface UseMemoTraceOptions<T> {
  label?: string // Should be a stable string.
  show?: (memoizedValue: T) => string
}

export function useMemo<T>(
  factory: () => T,
  deps: React.DependencyList | undefined,
  traceOptions?: UseMemoTraceOptions<T>,
): T {
  if (
    !util.isProductionBuild &&
    !util.isServerRendered &&
    componentRegistry.isCurrentComponentTraced()
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMemoTraced(factory, deps, traceOptions)
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return React.useMemo(factory, deps)
  }
}

const useMemoTraced = <T>(
  factoryRaw: () => T,
  deps: React.DependencyList | undefined,
  traceOptions?: UseMemoTraceOptions<T>,
): T => {
  const traceOrigin = componentRegistry.registerHook('memo', traceOptions?.label)
  const componentLabel = componentRegistry.getCurrentComponentLabel()
  const show = traceOptions?.show ?? util.showValue
  const showValueRef = React.useRef(show) // Ref to pass showValue to factory function.
  showValueRef.current = show

  const isInitialized = useRef(false)

  const factory = () => {
    const phase = !isInitialized.current ? 'init' : 'refresh'
    if (!isInitialized.current) {
      isInitialized.current = true
    }

    const memoizedValue = factoryRaw()
    traceOrigin.info = showValueRef.current(memoizedValue)

    tracer.trace(componentLabel, traceOrigin, phase, {
      value: memoizedValue,
      show: showValueRef.current,
    })
    return memoizedValue
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(factory, deps)
}
