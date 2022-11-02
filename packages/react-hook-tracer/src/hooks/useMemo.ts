import React, { useRef } from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import * as util from '../util'

export interface UseMemoTraceOptions<T> {
  label?: string // Should be a stable string
  show?: (memoizedValue: T) => string // Should be a stable function.
}

export function useMemo<T>(
  factory: () => T,
  deps: React.DependencyList | undefined,
  traceOptions?: UseMemoTraceOptions<T>,
): T {
  if (!util.isProductionBuild && componentRegistry.isCurrentComponentTraced()) {
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
  const show = traceOptions?.show ?? ((value: T) => JSON.stringify(value))

  const isInitialized = useRef(false)

  const factory = () => {
    const phase = !isInitialized.current ? 'init' : 'refresh'
    if (!isInitialized.current) {
      isInitialized.current = true
    }

    const memoizedValue = factoryRaw()
    traceOrigin.info = show(memoizedValue)

    tracer.trace(componentLabel, traceOrigin, phase)
    return memoizedValue
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(factory, deps)
}
