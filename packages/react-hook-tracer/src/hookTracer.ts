import React, { Dispatch, SetStateAction, useRef } from 'react'

import { tracer } from './Tracer'
import * as componentRegistry from './componentRegistry'
export { useTracer } from './useTracer'

export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>]
export function useState<S = undefined>(
  initialState?: S | (() => S),
): [S | undefined, Dispatch<SetStateAction<S | undefined>>] {
  const hook = componentRegistry.isCurrentComponentTraced() ? useStateTraced : React.useState
  return hook(initialState)
}

export function useEffect(effectRaw: React.EffectCallback, deps?: React.DependencyList): void {
  const hook = componentRegistry.isCurrentComponentTraced() ? useEffectTraced : React.useEffect
  return hook(effectRaw, deps)
}

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

const isInitialStateThunk = <S>(initialState: S | (() => S)): initialState is () => S =>
  typeof initialState === 'function'

const isUpdateFunction = <S>(
  setStateAction: SetStateAction<S>,
): setStateAction is (prevState: S) => S => typeof setStateAction === 'function'

const useStateTraced = <S>(
  initialStateOrThunk: S | (() => S),
): [S, Dispatch<SetStateAction<S>>] => {
  const traceOrigin = componentRegistry.registerHook('state')
  const label = componentRegistry.getCurrentComponentLabel()

  // If the initial-state argument is a thunk, we evaluate it here and call React.useState with the value.
  const initialState = isInitialStateThunk(initialStateOrThunk)
    ? initialStateOrThunk()
    : initialStateOrThunk

  const isInitialized = useRef(false)
  if (!isInitialized.current) {
    tracer.trace(label, traceOrigin, JSON.stringify(initialState), 'useState')
    traceOrigin.info = JSON.stringify(initialState)
    isInitialized.current = true
  }

  const [value, setValue] = React.useState(initialState)

  const setValueLogged: React.Dispatch<React.SetStateAction<S>> = (valueOrUpdateFunction) => {
    if (isUpdateFunction(valueOrUpdateFunction)) {
      setValue((prevState) => {
        const newValue = valueOrUpdateFunction(prevState)
        tracer.trace(label, traceOrigin, JSON.stringify(newValue), 'setState fn')
        traceOrigin.info = JSON.stringify(newValue) // TODO: string may get big
        return newValue
      })
    } else {
      const newValue = valueOrUpdateFunction
      tracer.trace(label, traceOrigin, JSON.stringify(newValue), 'setState')
      setValue(newValue)
      traceOrigin.info = JSON.stringify(newValue)
    }
  }

  return [value, setValueLogged]
}

const useEffectTraced = (effectRaw: React.EffectCallback, deps?: React.DependencyList): void => {
  const traceOrigin = componentRegistry.registerHook('effect')
  const label = componentRegistry.getCurrentComponentLabel()

  const isInitialized = useRef(false)
  if (!isInitialized.current) {
    tracer.trace({ label, origin: traceOrigin, customOriginLabel: 'useEffect' })
    isInitialized.current = true
  }

  const effect = () => {
    // maybe log which dep. changed

    tracer.trace({ label, origin: traceOrigin, customOriginLabel: 'run effect' })
    const cleanupRaw = effectRaw()
    if (cleanupRaw === undefined) {
      return
    } else {
      const cleanup = () => {
        tracer.trace({ label, origin: traceOrigin, customOriginLabel: 'clear effect' })
        cleanupRaw()
      }
      return cleanup
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, deps)
}

const useCallbackTraced = <A extends never[], R>(
  callbackRaw: (...args: A) => R,
  deps: React.DependencyList,
): ((...args: A) => R) => {
  const traceOrigin = componentRegistry.registerHook('callback')
  const label = componentRegistry.getCurrentComponentLabel()

  const isInitialized = useRef(false)
  if (!isInitialized.current) {
    tracer.trace({ label, origin: traceOrigin, customOriginLabel: 'useCallback' })
    isInitialized.current = true
  }

  // TODO: Maybe log when callback refreshes due to dependency changes.
  const callback = (...args: A) => {
    tracer.trace({ label, origin: traceOrigin, customOriginLabel: 'run callback' })
    return callbackRaw(...args)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(callback, deps)
}
