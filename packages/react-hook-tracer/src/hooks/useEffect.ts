import React from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import * as util from '../util'

import * as hookUtil from './hookUtil'

export interface UseEffectTraceOptions {
  label?: string // Should be a stable string.
}
export function useEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList,
  traceOptions?: UseEffectTraceOptions,
): void {
  const hook =
    !util.isProductionBuild &&
    !util.isServerRendered &&
    componentRegistry.isCurrentComponentTraced()
      ? useEffectTraced
      : React.useEffect
  return hook(effect, deps, traceOptions)
}

const useEffectTraced = (
  effectRaw: React.EffectCallback,
  deps?: React.DependencyList,
  traceOptions?: UseEffectTraceOptions,
): void => {
  const traceOrigin = componentRegistry.registerHook('effect', traceOptions?.label)
  const componentLabel = componentRegistry.getCurrentComponentLabel()
  hookUtil.useRunOnFirstRender(() => {
    tracer.trace(componentLabel, traceOrigin, 'init')
  })

  const effect = () => {
    // maybe log which dep. changed
    tracer.trace(componentLabel, traceOrigin, 'run')

    const cleanupRaw = effectRaw()
    if (cleanupRaw === undefined) {
      return
    } else {
      const cleanup = () => {
        tracer.trace(componentLabel, traceOrigin, 'cleanup')
        cleanupRaw()
      }
      return cleanup
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, deps)
}
