import React, { Dispatch, SetStateAction, useCallback, useRef } from 'react'

import { tracer } from './Tracer'
import * as internal from './componentRegistry'
import { HookPanel } from './components/HookPanel'

interface UseTracer {
  label: string
  trace: (message: string) => void
  HookPanel: () => JSX.Element
}
export const useTracer = (): UseTracer => {
  const componentInfo = internal.registerCurrentComponent()
  const label = componentInfo.label

  const traceOriginMount = internal.registerHook('mount')
  const traceOriginRender = internal.registerHook('render')
  const traceOriginTrace = internal.registerHook('trace') // TODO: is 'trace' overkill in the hookpanel?
  const traceOriginUnmount = internal.registerHook('unmount')

  // TODO: Is origin enough? Or do we want to control the string? (e.g. 'useState'/'setState' for 'state')

  const isInitialized = useRef(false)

  if (!isInitialized.current) {
    isInitialized.current = true
    tracer.trace(label, traceOriginMount)
  }

  // const pendingProps = internal.getCurrentOwner()?.pendingProps ?? {}
  // const memoizedProps = internal.getCurrentOwner()?.memoizedProps ?? {}
  // const updatedProps = util
  //   .getObjectKeys(pendingProps)
  //   .filter((prop) => pendingProps[prop] !== memoizedProps[prop])
  // const memoizedState = internal.getCurrentOwner()?.memoizedState ?? {}
  // tracer.trace(label, 'render', JSON.stringify(updatedProps))
  tracer.trace(label, traceOriginRender)

  // Effect with empty dependencies to track component unmount
  React.useEffect(
    () => () => {
      tracer.trace(label, traceOriginUnmount)
    },
    [label, traceOriginUnmount], // TODO: Maybe just ignore? Don't change anyway.
  )

  const trace = useCallback(
    (message: string) => tracer.trace(label, traceOriginTrace, message),
    [label, traceOriginTrace],
  )

  const WrappedHookPanel = useCallback(
    () => HookPanel({ label, getHookStages: () => componentInfo.registeredHooks }),
    [label, componentInfo.registeredHooks],
  )

  return { label, trace, HookPanel: WrappedHookPanel }
}

export const useState = <S>(initialState: S): [S, Dispatch<SetStateAction<S>>] => {
  const hook = internal.isCurrentComponentTraced() ? useStateTraced : React.useState
  return hook(initialState)
}

export const useEffect = (effectRaw: React.EffectCallback, deps?: React.DependencyList): void => {
  const hook = internal.isCurrentComponentTraced() ? useEffectTraced : React.useEffect
  return hook(effectRaw, deps)
}

const isUpdateFunction = <S>(
  setStateAction: SetStateAction<S>,
): setStateAction is (prevState: S) => S => typeof setStateAction === 'function'

const useStateTraced = <S>(initialState: S): [S, Dispatch<SetStateAction<S>>] => {
  const hookInfo = internal.registerHook('state')
  const label = internal.getCurrentComponentLabel()

  const isInitialized = useRef(false)
  if (!isInitialized.current) {
    tracer.trace(label, hookInfo, JSON.stringify(initialState))
    hookInfo.info = JSON.stringify(initialState)
    isInitialized.current = true
  }

  const [value, setValue] = React.useState(initialState)

  const setValueLogged: React.Dispatch<React.SetStateAction<S>> = (valueOrUpdateFunction) => {
    if (isUpdateFunction(valueOrUpdateFunction)) {
      setValue((prevState) => {
        const newValue = valueOrUpdateFunction(prevState)
        tracer.trace(label, hookInfo, `setState fn ${JSON.stringify(newValue)}`)
        hookInfo.info = JSON.stringify(newValue) // TODO: string may get big
        return newValue
      })
    } else {
      const newValue = valueOrUpdateFunction
      tracer.trace(label, hookInfo, `setState ${JSON.stringify(newValue)}`)
      setValue(newValue)
      hookInfo.info = JSON.stringify(newValue)
    }
  }

  return [value, setValueLogged]
}

const useEffectTraced = (effectRaw: React.EffectCallback, deps?: React.DependencyList): void => {
  const hookInfo = internal.registerHook('effect')
  const label = internal.getCurrentComponentLabel()

  const isInitialized = useRef(false)
  if (!isInitialized.current) {
    tracer.trace(label, hookInfo, 'init')
    isInitialized.current = true
  } else {
    // maybe log which dep. changed
    // console.log(deps)
  }

  const effect = () => {
    tracer.trace(label, hookInfo, 'running effect')
    const cleanupRaw = effectRaw()
    if (cleanupRaw === undefined) {
      return
    } else {
      const cleanup = () => {
        tracer.trace(label, hookInfo, 'cleanup')
        cleanupRaw()
      }
      return cleanup
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, deps)
}
