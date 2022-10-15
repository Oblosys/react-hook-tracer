import React, { useRef } from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'

// Typing useCallback is a bit of a nuisance as it uses Function.
// eslint-disable-next-line @typescript-eslint/ban-types
export function useCallback<F extends Function>(callbackRaw: F, deps: React.DependencyList): F {
  if (componentRegistry.isCurrentComponentTraced()) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCallbackTraced(
      callbackRaw as unknown as (...args: never[]) => unknown, // Convert untyped Function to explicit function type.
      deps,
    ) as unknown as F // Correct, since result of useCallbackTraced has the same type as its callback argument.
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return React.useCallback(callbackRaw, deps)
  }
}

const useCallbackTraced = <A extends never[], R>(
  callbackRaw: (...args: A) => R,
  deps: React.DependencyList,
): ((...args: A) => R) => {
  const traceOrigin = componentRegistry.registerHook('callback')
  const label = componentRegistry.getCurrentComponentLabel()

  const callback = (...args: A) => {
    tracer.trace({ label, origin: traceOrigin, customOriginLabel: 'run callback' })
    return callbackRaw(...args)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = React.useCallback(callback, deps)

  const previousCallbackRef = useRef<(...args: A) => R>()
  if (memoizedCallback !== previousCallbackRef.current) {
    const message = previousCallbackRef.current === undefined ? 'init' : 'refresh'
    // TODO: Maybe log which dependency changed (will just be an index, as we don't have names).
    tracer.trace({ label, origin: traceOrigin, customOriginLabel: 'useCallback', message })
  }
  previousCallbackRef.current = memoizedCallback

  return memoizedCallback
}
