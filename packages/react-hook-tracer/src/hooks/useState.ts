import React, { Dispatch, SetStateAction } from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import * as util from '../util'
import * as hookUtil from './hookUtil'

export interface UseStateTraceOptions<S> {
  label?: string // Should be a stable string
  show?: (state: S) => string // Should be a stable function.
}
export function useState<S>(
  initialState: S | (() => S),
  traceOptions?: UseStateTraceOptions<S>,
): [S, Dispatch<SetStateAction<S>>]
export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>]
// Extra overload for passing traceOptions without initialState:
export function useState<S = undefined>(
  initialState: undefined,
  traceOptions: UseStateTraceOptions<S>,
): [S | undefined, Dispatch<SetStateAction<S | undefined>>]
export function useState<S = undefined>(
  initialState?: S | (() => S),
  traceOptions?: UseStateTraceOptions<S>,
): [S | undefined, Dispatch<SetStateAction<S | undefined>>] {
  if (componentRegistry.isCurrentComponentTraced()) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useStateTraced(initialState, traceOptions)
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return React.useState(initialState)
  }
}

const useStateTraced = <S>(
  initialStateOrThunk: S | (() => S) | undefined,
  traceOptions?: UseStateTraceOptions<S>,
): [S | undefined, Dispatch<SetStateAction<S | undefined>>] => {
  const traceOrigin = componentRegistry.registerHook('state', traceOptions?.label)
  const componentLabel = componentRegistry.getCurrentComponentLabel()

  const showDefinedState = traceOptions?.show ?? ((state: S) => JSON.stringify(state))

  const showState = util.showWithUndefined(showDefinedState)

  // If the initial-state argument is a thunk, we evaluate it here and call React.useState with the value.
  const initialState = isInitialStateThunk(initialStateOrThunk)
    ? initialStateOrThunk()
    : initialStateOrThunk

  hookUtil.useRunOnFirstRender(() => {
    traceOrigin.info = showState(initialState)
    tracer.trace(componentLabel, traceOrigin, 'init', { value: initialState, show: showState })
  })

  const [value, setValue] = React.useState(initialState)

  const setValueTraced: React.Dispatch<React.SetStateAction<S | undefined>> = (
    valueOrUpdateFunction,
  ) => {
    if (isUpdateFunction(valueOrUpdateFunction)) {
      setValue((prevState) => {
        const newValue = valueOrUpdateFunction(prevState)
        traceOrigin.info = showState(newValue)
        tracer.trace(componentLabel, traceOrigin, 'update', { value: newValue, show: showState })
        return newValue
      })
    } else {
      const newValue = valueOrUpdateFunction
      traceOrigin.info = showState(newValue)
      tracer.trace(componentLabel, traceOrigin, 'set', { value: newValue, show: showState })
      setValue(newValue)
    }
  }

  return [value, setValueTraced]
}

const isInitialStateThunk = <S>(initialState: S | (() => S)): initialState is () => S =>
  typeof initialState === 'function'

const isUpdateFunction = <S>(
  setStateAction: SetStateAction<S>,
): setStateAction is (prevState: S) => S => typeof setStateAction === 'function'
