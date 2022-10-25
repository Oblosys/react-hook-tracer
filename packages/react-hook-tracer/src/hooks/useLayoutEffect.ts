import React from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import * as hookUtil from './hookUtil'

export function useLayoutEffect(
  effectRaw: React.EffectCallback,
  deps?: React.DependencyList,
): void {
  const hook = componentRegistry.isCurrentComponentTraced()
    ? useLayoutEffectTraced
    : React.useEffect
  return hook(effectRaw, deps)
}

const useLayoutEffectTraced = (
  effectRaw: React.EffectCallback,
  deps?: React.DependencyList,
): void => {
  const traceOrigin = componentRegistry.registerHook('layout')
  const componentLabel = componentRegistry.getCurrentComponentLabel()
  hookUtil.useRunOnFirstRender(() => {
    tracer.trace({ componentLabel, origin: traceOrigin, phase: 'init' })
  })

  const effect = () => {
    tracer.trace({ componentLabel, origin: traceOrigin, phase: 'run' })
    effectRaw()
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useLayoutEffect(effect, deps)
}
