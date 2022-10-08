import React, { Dispatch, SetStateAction, useCallback, useRef } from 'react'

import { tracer } from './Tracer'
import * as componentRegistry from './componentRegistry'
import { HookPanel } from './components/HookPanel'

interface UseTracer {
  label: string
  trace: (message: string) => void
  HookPanel: () => JSX.Element
}
export const useTracer = (): UseTracer => {
  const componentInfo = componentRegistry.registerCurrentComponent()
  const label = componentInfo.label

  const isInitialized = useRef(false)

  if (!isInitialized.current) {
    isInitialized.current = true
    tracer.trace(label, componentInfo.traceOrigins.mount)
  }

  tracer.trace(label, componentInfo.traceOrigins.render)

  // Effect with empty dependencies to track component unmount
  React.useEffect(
    () => () => {
      tracer.trace(label, componentInfo.traceOrigins.unmount)
    },
    [label, componentInfo.traceOrigins.unmount], // TODO: Maybe just ignore? Don't change anyway.
  )

  const trace = useCallback(
    (message: string) => tracer.trace(label, componentInfo.traceOrigins.trace, message),
    [label, componentInfo.traceOrigins.trace],
  )

  const WrappedHookPanel = useCallback(
    () => HookPanel({ label, traceOrigins: componentInfo.traceOrigins }),
    [label, componentInfo.traceOrigins],
  )

  return { label, trace, HookPanel: WrappedHookPanel }
}

export const useState = <S>(initialState: S): [S, Dispatch<SetStateAction<S>>] => {
  const hook = componentRegistry.isCurrentComponentTraced() ? useStateTraced : React.useState
  return hook(initialState)
}

export const useEffect = (effectRaw: React.EffectCallback, deps?: React.DependencyList): void => {
  const hook = componentRegistry.isCurrentComponentTraced() ? useEffectTraced : React.useEffect
  return hook(effectRaw, deps)
}

const isUpdateFunction = <S>(
  setStateAction: SetStateAction<S>,
): setStateAction is (prevState: S) => S => typeof setStateAction === 'function'

const useStateTraced = <S>(initialState: S): [S, Dispatch<SetStateAction<S>>] => {
  const traceOrigin = componentRegistry.registerHook('state')
  const label = componentRegistry.getCurrentComponentLabel()

  const isInitialized = useRef(false)
  if (!isInitialized.current) {
    tracer.trace(label, traceOrigin, JSON.stringify(initialState))
    traceOrigin.info = JSON.stringify(initialState)
    isInitialized.current = true
  }

  const [value, setValue] = React.useState(initialState)

  const setValueLogged: React.Dispatch<React.SetStateAction<S>> = (valueOrUpdateFunction) => {
    if (isUpdateFunction(valueOrUpdateFunction)) {
      setValue((prevState) => {
        const newValue = valueOrUpdateFunction(prevState)
        tracer.trace(label, traceOrigin, `setState fn ${JSON.stringify(newValue)}`)
        traceOrigin.info = JSON.stringify(newValue) // TODO: string may get big
        return newValue
      })
    } else {
      const newValue = valueOrUpdateFunction
      tracer.trace(label, traceOrigin, `setState ${JSON.stringify(newValue)}`)
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
    tracer.trace(label, traceOrigin, 'init')
    isInitialized.current = true
  } else {
    // maybe log which dep. changed
    // console.log(deps)
  }

  const effect = () => {
    tracer.trace(label, traceOrigin, 'running effect')
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
