import React from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import * as hookUtil from './hookUtil'

export interface UseInsertionEffectTraceOptions {
  label?: string // Should be a stable string
}
export function useInsertionEffect(
  effectRaw: React.EffectCallback,
  deps?: React.DependencyList,
  traceOptions?: UseInsertionEffectTraceOptions,
): void {
  const hook = componentRegistry.isCurrentComponentTraced()
    ? useInsertionEffectTraced
    : React.useEffect
  return hook(effectRaw, deps, traceOptions)
}

const useInsertionEffectTraced = (
  effectRaw: React.EffectCallback,
  deps?: React.DependencyList,
  traceOptions?: UseInsertionEffectTraceOptions,
): void => {
  const traceOrigin = componentRegistry.registerHook('insertion', traceOptions?.label)
  const componentLabel = componentRegistry.getCurrentComponentLabel()
  hookUtil.useRunOnFirstRender(() => {
    tracer.trace({ componentLabel, origin: traceOrigin, phase: 'init' })
  })

  const effect = () => {
    tracer.trace({ componentLabel, origin: traceOrigin, phase: 'run' })
    effectRaw()
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useInsertionEffect(effect, deps)
}
