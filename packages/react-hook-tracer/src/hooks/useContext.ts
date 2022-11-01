import React, { Context } from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import * as hookUtil from './hookUtil'

export interface UseContextTraceOptions<T> {
  label?: string // Should be a stable string
  show?: (contextValue: T) => string // Should be a stable function.
}

export function useContext<T>(context: Context<T>, traceOptions?: UseContextTraceOptions<T>): T {
  if (componentRegistry.isCurrentComponentTraced()) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useContextTraced(context, traceOptions)
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return React.useContext(context)
  }
}

const useContextTraced = <T>(context: Context<T>, traceOptions?: UseContextTraceOptions<T>): T => {
  const traceOrigin = componentRegistry.registerHook('context', traceOptions?.label)
  const componentLabel = componentRegistry.getCurrentComponentLabel()

  const show = traceOptions?.show ?? ((context: T) => JSON.stringify(context))

  const contextValue = React.useContext(context)

  hookUtil.useRunOnFirstRender(() => {
    traceOrigin.info = show(contextValue)
    tracer.trace(componentLabel, traceOrigin, 'init', { value: contextValue, show })
  })

  // Keep track of the context value in a ref, and trace and 'update' message whenever it changes.
  const contextValueRef = React.useRef<T>(contextValue)

  if (contextValueRef.current !== contextValue) {
    traceOrigin.info = show(contextValue)
    tracer.trace(componentLabel, traceOrigin, 'update', { value: contextValue, show })
    contextValueRef.current = contextValue
  }

  return contextValue
}