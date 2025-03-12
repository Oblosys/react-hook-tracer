import React, {
  Dispatch,
  DispatchWithoutAction,
  Reducer,
  ReducerAction,
  ReducerState,
  ReducerStateWithoutAction,
  ReducerWithoutAction,
  useCallback,
} from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import * as util from '../util'

import * as hookUtil from './hookUtil'

export interface UseReducerTraceOptions<S, A> {
  label?: string // Should be a stable string.
  showState?: (state: S) => string
  showAction?: (state: A) => string
}

export interface UseReducerTraceOptionsWithoutAction<S> {
  label?: string // Should be a stable string.
  showState?: (state: S) => string
}

// useReducer overloads from @types/react:

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useReducer<R extends ReducerWithoutAction<any>, I>(
  reducer: R,
  initializerArg: I,
  initializer: (arg: I) => ReducerStateWithoutAction<R>,
  traceOptions?: UseReducerTraceOptionsWithoutAction<ReducerState<R>>,
): [ReducerStateWithoutAction<R>, DispatchWithoutAction]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useReducer<R extends ReducerWithoutAction<any>>(
  reducer: R,
  initializerArg: ReducerStateWithoutAction<R>,
  initializer?: undefined,
  traceOptions?: UseReducerTraceOptionsWithoutAction<ReducerState<R>>,
): [ReducerStateWithoutAction<R>, DispatchWithoutAction]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I & ReducerState<R>,
  initializer: (arg: I & ReducerState<R>) => ReducerState<R>,
  traceOptions?: UseReducerTraceOptions<ReducerState<R>, ReducerAction<R>>,
): [ReducerState<R>, Dispatch<ReducerAction<R>>]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I,
  initializer: (arg: I) => ReducerState<R>,
  traceOptions?: UseReducerTraceOptions<ReducerState<R>, ReducerAction<R>>,
): [ReducerState<R>, Dispatch<ReducerAction<R>>]

// The useReducer overload types are rather messy, with todo's and doubts in the index.d.ts file. Typing useReduce with
// its contravariant function-parameter types is tricky, and since useReduce itself is not written in TypeScript, there
// may not even be a meaningful implementation signature that matches all overloads. And even if there is, we would not
// be able to call React.useReducer with the parameter types from that signature anyway. As such, there are a couple of
// unavoidable `any` type assertions in the code below.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
  initializer?: undefined,
  traceOptions?: UseReducerTraceOptions<ReducerState<R>, ReducerAction<R>>,
): [ReducerState<R>, Dispatch<ReducerAction<R>>]
export function useReducer<I, S, A>(
  reducer: Reducer<S, A>,
  initialArg: I,
  initializer?: (arg: I) => S,
  traceOptions?: UseReducerTraceOptions<S, A>,
): [S, Dispatch<A>] {
  if (
    !util.isProductionBuild &&
    !util.isServerRendered &&
    componentRegistry.isCurrentComponentTraced()
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useReducerTraced(reducer, initialArg, initializer, traceOptions)
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    return React.useReducer(reducer, initialArg as any, initializer as any)
  }
}

const useReducerTraced = <I, S, A>(
  rawReducer: (prevState: S, action: A) => S,
  initialArg: I,
  initializer?: (arg: I) => S,
  traceOptions?: UseReducerTraceOptions<S, A>,
): [S, Dispatch<A>] => {
  const traceOrigin = componentRegistry.registerHook('reducer', traceOptions?.label)
  const componentLabel = componentRegistry.getCurrentComponentLabel()

  const showState = traceOptions?.showState ?? util.showValue
  const showAction = traceOptions?.showAction ?? util.showValue

  hookUtil.useRunOnFirstRender(() => {
    const initialState =
      initializer !== undefined
        ? initializer(initialArg)
        : // Without the initializer argument, initialArg will be the initial state, which we can't elegantly express.
          (initialArg as unknown as S)

    traceOrigin.info = showState(initialState)
    tracer.trace(componentLabel, traceOrigin, 'init', { value: initialState, show: showState })
  })

  // No need to put showState in a ref, since useReducer does not memoize its reducer argument.
  const reducer = (prevState: S, action: A): S => {
    const state = rawReducer(prevState, action)
    traceOrigin.info = showState(state)
    tracer.trace(componentLabel, traceOrigin, 'state', { value: state, show: showState })
    return state
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  const [state, dispatch] = React.useReducer(reducer, initialArg as any, initializer as any) // Unavoidable any's.

  const showActionRef = React.useRef(showAction) // Ref to pass showAction to dispatch function.
  showActionRef.current = showAction

  const tracedDispatch: (action: A) => void = useCallback(
    (action: A) => {
      tracer.trace(componentLabel, traceOrigin, 'dispatch', {
        value: action,
        show: showActionRef.current,
      })
      return dispatch(action)
    },
    [componentLabel, traceOrigin], // All stable.
  )

  return [state, tracedDispatch]
}
