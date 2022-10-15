import React, { useRef } from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'

export function useEffect(effectRaw: React.EffectCallback, deps?: React.DependencyList): void {
  const hook = componentRegistry.isCurrentComponentTraced() ? useEffectTraced : React.useEffect
  return hook(effectRaw, deps)
}

const useEffectTraced = (effectRaw: React.EffectCallback, deps?: React.DependencyList): void => {
  const traceOrigin = componentRegistry.registerHook('effect')
  const label = componentRegistry.getCurrentComponentLabel()

  const isInitialized = useRef(false)
  if (!isInitialized.current) {
    tracer.trace(label, traceOrigin, 'init')
    isInitialized.current = true
  }

  const effect = () => {
    // maybe log which dep. changed
    tracer.trace(label, traceOrigin, 'run')

    const cleanupRaw = effectRaw()
    if (cleanupRaw === undefined) {
      return
    } else {
      const cleanup = () => {
        tracer.trace(label, traceOrigin, 'cleanup')
        cleanupRaw()
      }
      return cleanup
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, deps)
}
