import React, { Dispatch, SetStateAction, useRef } from 'react'

import * as internals from './internals'
import { trace } from './tracer'

export const useTracer = (): { label: string } => {
  const label = internals.getComponentLabel()
  const isInitialized = useRef(false)

  if (!isInitialized.current) {
    isInitialized.current = true
    trace(label, 'mount')
  }

  trace(label, 'render')

  // Effect with empty dependencies to track component unmount
  React.useEffect(
    () => () => {
      trace(label, 'unmounted')
    },
    [label], // TODO: Maybe just ignore? Doesn't change anyway.
  )

  return { label: internals.getComponentLabel() }
}

const isUpdateFn = <S>(setStateAction: SetStateAction<S>): setStateAction is (prevState: S) => S =>
  typeof setStateAction === 'function'

export const useState = <S>(initialState: S): [S, Dispatch<SetStateAction<S>>] => {
  const label = internals.getComponentLabel()
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
        trace(label, 'setState', JSON.stringify(newValue))
        return newValue
      })
    } else {
      trace(label, 'setState', JSON.stringify(setStateAction))
      setValue(setStateAction)
    }
  }
  return [value, setValueLogged]
}

export const useEffect = (effectRaw: React.EffectCallback, deps?: React.DependencyList): void => {
  const label = internals.getComponentLabel()

  const isInitialized = useRef(false)
  if (!isInitialized.current) {
    trace(label, 'useEffect')
    isInitialized.current = true
  } else {
    // maybe log which dep. changed
    // console.log(deps)
  }

  const effect = () => {
    trace(label, 'useEffect', 'effect')
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
