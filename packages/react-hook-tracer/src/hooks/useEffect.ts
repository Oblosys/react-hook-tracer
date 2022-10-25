import React from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import * as hookUtil from './hookUtil'

export function useEffect(effectRaw: React.EffectCallback, deps?: React.DependencyList): void {
  const hook = componentRegistry.isCurrentComponentTraced() ? useEffectTraced : React.useEffect
  return hook(effectRaw, deps)
}

const useEffectTraced = (effectRaw: React.EffectCallback, deps?: React.DependencyList): void => {
  const traceOrigin = componentRegistry.registerHook('effect')
  const label = componentRegistry.getCurrentComponentLabel()
  hookUtil.useRunOnFirstRender(() => {
    tracer.trace({ label, origin: traceOrigin, phase: 'init' })
  })

  const effect = () => {
    // maybe log which dep. changed
    tracer.trace({ label, origin: traceOrigin, phase: 'run' })

    const cleanupRaw = effectRaw()
    if (cleanupRaw === undefined) {
      return
    } else {
      const cleanup = () => {
        tracer.trace({ label, origin: traceOrigin, phase: 'cleanup' })
        cleanupRaw()
      }
      return cleanup
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, deps)
}
