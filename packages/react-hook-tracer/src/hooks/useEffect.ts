import React from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import * as hookUtil from './hookUtil'

export interface UseEffectTraceOptions {
  label?: string // Should be a stable string
}
export function useEffect(
  effectRaw: React.EffectCallback,
  deps?: React.DependencyList,
  traceOptions?: UseEffectTraceOptions,
): void {
  const hook = componentRegistry.isCurrentComponentTraced() ? useEffectTraced : React.useEffect
  return hook(effectRaw, deps, traceOptions)
}

const useEffectTraced = (
  effectRaw: React.EffectCallback,
  deps?: React.DependencyList,
  traceOptions?: UseEffectTraceOptions,
): void => {
  const traceOrigin = componentRegistry.registerHook('effect', traceOptions?.label)
  const componentLabel = componentRegistry.getCurrentComponentLabel()
  hookUtil.useRunOnFirstRender(() => {
    tracer.trace({ componentLabel, origin: traceOrigin, phase: 'init' })
  })

  const effect = () => {
    // maybe log which dep. changed
    tracer.trace({ componentLabel, origin: traceOrigin, phase: 'run' })

    const cleanupRaw = effectRaw()
    if (cleanupRaw === undefined) {
      return
    } else {
      const cleanup = () => {
        tracer.trace({ componentLabel, origin: traceOrigin, phase: 'cleanup' })
        cleanupRaw()
      }
      return cleanup
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, deps)
}
