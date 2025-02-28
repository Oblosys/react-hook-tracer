import React from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import * as util from '../util'

import * as hookUtil from './hookUtil'

export interface UseInsertionEffectTraceOptions {
  label?: string // Should be a stable string.
}
export function useInsertionEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList,
  traceOptions?: UseInsertionEffectTraceOptions,
): void {
  const hook =
    !util.isProductionBuild &&
    !util.isServerRendered &&
    componentRegistry.isCurrentComponentTraced()
      ? useInsertionEffectTraced
      : React.useInsertionEffect
  return hook(effect, deps, traceOptions)
}

const useInsertionEffectTraced = (
  effectRaw: React.EffectCallback,
  deps?: React.DependencyList,
  traceOptions?: UseInsertionEffectTraceOptions,
): void => {
  const traceOrigin = componentRegistry.registerHook('insertion', traceOptions?.label)
  const componentLabel = componentRegistry.getCurrentComponentLabel()
  hookUtil.useRunOnFirstRender(() => {
    tracer.trace(componentLabel, traceOrigin, 'init')
  })

  const effect = () => {
    tracer.trace(componentLabel, traceOrigin, 'run')
    effectRaw()
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useInsertionEffect(effect, deps)
}
