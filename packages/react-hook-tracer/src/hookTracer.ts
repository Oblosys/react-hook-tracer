import React, { Dispatch, SetStateAction, useRef } from 'react'

import { tracer } from './Tracer'
import * as componentRegistry from './componentRegistry'
export { useTracer } from './useTracer'

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
  } else {
    // maybe log which dep. changed
    // console.log(deps)
  }

  const effect = () => {
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
