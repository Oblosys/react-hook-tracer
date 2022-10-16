import React, { Dispatch, SetStateAction, useRef } from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'

export function useState<S>(
  initialState: S | (() => S),
  showState?: (s: S) => string,
): [S, Dispatch<SetStateAction<S>>]
export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>]
export function useState<S = undefined>(
  initialState: undefined,
  showState: (s: S) => string,
): [S | undefined, Dispatch<SetStateAction<S | undefined>>] // Extra overload for passing showState without initialState
export function useState<S = undefined>(
  initialState?: S | (() => S),
  showState?: (s: S) => string,
): [S | undefined, Dispatch<SetStateAction<S | undefined>>] {
  if (componentRegistry.isCurrentComponentTraced()) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useStateTraced(initialState, showState)
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return React.useState(initialState)
  }
}

const isInitialStateThunk = <S>(initialState: S | (() => S)): initialState is () => S =>
  typeof initialState === 'function'

const isUpdateFunction = <S>(
  setStateAction: SetStateAction<S>,
): setStateAction is (prevState: S) => S => typeof setStateAction === 'function'

const useStateTraced = <S>(
  initialStateOrThunk: S | (() => S) | undefined,
  showStateFn: ((s: S) => string) | undefined,
): [S | undefined, Dispatch<SetStateAction<S | undefined>>] => {
  const traceOrigin = componentRegistry.registerHook('state')
  const label = componentRegistry.getCurrentComponentLabel()

  const showUndefined =
    <T>(show: (x: T) => string) =>
    (x: T | undefined) =>
      x === undefined ? 'undefined' : show(x)

  const showProperState = showStateFn ?? ((s: S) => JSON.stringify(s))

  const showState = showUndefined(showProperState)

  // If the initial-state argument is a thunk, we evaluate it here and call React.useState with the value.
  const initialState = isInitialStateThunk(initialStateOrThunk)
    ? initialStateOrThunk()
    : initialStateOrThunk

  const isInitialized = useRef(false)
  if (!isInitialized.current) {
    tracer.trace(label, traceOrigin, showState(initialState), 'init:')
    traceOrigin.info = showState(initialState)
    isInitialized.current = true
  }

  const [value, setValue] = React.useState(initialState)

  const setValueTraced: React.Dispatch<React.SetStateAction<S | undefined>> = (
    valueOrUpdateFunction,
  ) => {
    if (isUpdateFunction(valueOrUpdateFunction)) {
      setValue((prevState) => {
        const newValue = valueOrUpdateFunction(prevState)
        tracer.trace(label, traceOrigin, showState(newValue), 'update:')
        traceOrigin.info = showState(newValue)
        return newValue
      })
    } else {
      const newValue = valueOrUpdateFunction
      tracer.trace(label, traceOrigin, showState(newValue), 'set:')
      setValue(newValue)
      traceOrigin.info = showState(newValue)
    }
  }

  return [value, setValueTraced]
}
