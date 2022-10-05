import React, { Dispatch, SetStateAction, useCallback, useRef } from 'react'

import * as internal from './internal'
import { trace } from './tracer'

interface UseTracer {
  label: string
  trace: (message: string) => void
  hooks: string[]
}
export const useTracer = (): UseTracer => {
  internal.getComponentInfo().isTraced = true
  internal.initHookRegister()
  const label = internal.getComponentLabel()

  const customTrace = useCallback((message: string) => trace(label, 'trace', message), [label])

  const isInitialized = useRef(false)

  if (!isInitialized.current) {
    isInitialized.current = true
    trace(label, 'mount')
  }

  // const pendingProps = internal.getCurrentOwner()?.pendingProps ?? {}
  // const memoizedProps = internal.getCurrentOwner()?.memoizedProps ?? {}
  // const updatedProps = util
  //   .getObjectKeys(pendingProps)
  //   .filter((prop) => pendingProps[prop] !== memoizedProps[prop])
  // const memoizedState = internal.getCurrentOwner()?.memoizedState ?? {}
  // trace(label, 'render', JSON.stringify(updatedProps))

  // Effect with empty dependencies to track component unmount
  React.useEffect(
    () => () => {
      trace(label, 'unmounted')
    },
    [label], // TODO: Maybe just ignore? Doesn't change anyway.
  )

  return { label, trace: customTrace, hooks: internal.getComponentInfo().registeredHooks }
}

export const useState = <S>(initialState: S): [S, Dispatch<SetStateAction<S>>] => {
  const f = internal.getComponentInfo().isTraced ? useStateTraced : React.useState
  return f(initialState)
}

export const useEffect = (effectRaw: React.EffectCallback, deps?: React.DependencyList): void => {
  const f = internal.getComponentInfo().isTraced ? useEffectTraced : React.useEffect
  return f(effectRaw, deps)
}

const isUpdateFn = <S>(setStateAction: SetStateAction<S>): setStateAction is (prevState: S) => S =>
  typeof setStateAction === 'function'

const useStateTraced = <S>(initialState: S): [S, Dispatch<SetStateAction<S>>] => {
  internal.registerHook('state')
  const label = internal.getComponentLabel()

  const isInitialized = useRef(false)
  if (!isInitialized.current) {
    trace(label, 'useState', JSON.stringify(initialState))
    isInitialized.current = true
  }

  const [value, setValue] = React.useState(initialState)
  const setValueLogged: React.Dispatch<React.SetStateAction<S>> = (setStateAction) => {
    if (isUpdateFn(setStateAction)) {
      setValue((prevState) => {
        const newValue = setStateAction(prevState)
        trace(label, 'setState fn', JSON.stringify(newValue))
        return newValue
      })
    } else {
      trace(label, 'setState', JSON.stringify(setStateAction))
      setValue(setStateAction)
    }
  }
  return [value, setValueLogged]
}

const useEffectTraced = (effectRaw: React.EffectCallback, deps?: React.DependencyList): void => {
  internal.registerHook('effect')
  const label = internal.getComponentLabel()

  const isInitialized = useRef(false)
  if (!isInitialized.current) {
    trace(label, 'useEffect', 'init')
    isInitialized.current = true
  } else {
    // maybe log which dep. changed
    // console.log(deps)
  }

  const effect = () => {
    trace(label, 'useEffect', 'running effect')
    const cleanupRaw = effectRaw()
    if (cleanupRaw === undefined) {
      return
    } else {
      const cleanup = () => {
        trace(label, 'useEffect', 'cleanup')
        cleanupRaw()
      }
      return cleanup
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, deps)
}
