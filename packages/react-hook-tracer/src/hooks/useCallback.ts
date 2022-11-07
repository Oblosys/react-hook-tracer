import React, { useRef } from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import * as util from '../util'

export interface UseCallbackTraceOptions {
  label?: string // Should be a stable string.
}

// Typing useCallback is a bit of a nuisance as it uses Function.
// eslint-disable-next-line @typescript-eslint/ban-types
export function useCallback<F extends Function>(
  callback: F,
  deps: React.DependencyList,
  traceOptions?: UseCallbackTraceOptions,
): F {
  if (!util.isProductionBuild && componentRegistry.isCurrentComponentTraced()) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCallbackTraced(
      callback as unknown as (...args: never[]) => unknown, // Convert untyped Function to explicit function type.
      deps,
      traceOptions,
    ) as unknown as F // Correct, since result of useCallbackTraced has the same type as its callback argument.
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return React.useCallback(callback, deps)
  }
}

const useCallbackTraced = <A extends never[], R>(
  callbackRaw: (...args: A) => R,
  deps: React.DependencyList,
  traceOptions?: UseCallbackTraceOptions,
): ((...args: A) => R) => {
  const traceOrigin = componentRegistry.registerHook('callback', traceOptions?.label)
  const componentLabel = componentRegistry.getCurrentComponentLabel()

  const callback = (...args: A) => {
    tracer.trace(componentLabel, traceOrigin, 'run')
    return callbackRaw(...args)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = React.useCallback(callback, deps)

  const previousCallbackRef = useRef<(...args: A) => R>()
  if (memoizedCallback !== previousCallbackRef.current) {
    const phase = previousCallbackRef.current === undefined ? 'init' : 'refresh'
    // TODO: Maybe log which dependency changed (will just be an index, as we don't have names).
    tracer.trace(componentLabel, traceOrigin, phase)
  }
  previousCallbackRef.current = memoizedCallback

  return memoizedCallback
}
