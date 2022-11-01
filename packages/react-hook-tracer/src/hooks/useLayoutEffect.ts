import React from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import * as hookUtil from './hookUtil'

export interface UseLayoutEffectTraceOptions {
  label?: string // Should be a stable string
}

export function useLayoutEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList,
  traceOptions?: UseLayoutEffectTraceOptions,
): void {
  const hook = componentRegistry.isCurrentComponentTraced()
    ? useLayoutEffectTraced
    : React.useEffect
  return hook(effect, deps, traceOptions)
}

const useLayoutEffectTraced = (
  effectRaw: React.EffectCallback,
  deps?: React.DependencyList,
  traceOptions?: UseLayoutEffectTraceOptions,
): void => {
  const traceOrigin = componentRegistry.registerHook('layout', traceOptions?.label)
  const componentLabel = componentRegistry.getCurrentComponentLabel()
  hookUtil.useRunOnFirstRender(() => {
    tracer.trace(componentLabel, traceOrigin, 'init')
  })

  const effect = () => {
    tracer.trace(componentLabel, traceOrigin, 'run')
    effectRaw()
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useLayoutEffect(effect, deps)
}
