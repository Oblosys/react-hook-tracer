import React, { MutableRefObject, RefObject } from 'react'

import { tracer } from '../Tracer'
import * as componentRegistry from '../componentRegistry'
import { getCurrentComponentInfo } from '../componentRegistry'
import * as util from '../util'
import * as hookUtil from './hookUtil'

export interface UseRefTraceOptions<T> {
  label?: string // Should be a stable string
  showValue?: (s: T) => string // Should be a stable function.
}
export function useRef<T>(
  initialValue: T,
  traceOptions?: UseRefTraceOptions<T>,
): MutableRefObject<T>
export function useRef<T>(
  initialValue: T | null,
  traceOptions?: UseRefTraceOptions<T>,
): RefObject<T>
export function useRef<T = undefined>(): MutableRefObject<T | undefined>
// Extra overload for passing traceOptions without initialValue:
export function useRef<T = undefined>(
  initialValue: undefined,
  traceOptions: UseRefTraceOptions<T>,
): MutableRefObject<T | undefined>
export function useRef<T>(
  initialValue?: T,
  traceOptions?: UseRefTraceOptions<T>,
): MutableRefObject<T | undefined> | RefObject<T | undefined> {
  if (componentRegistry.isCurrentComponentTraced()) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRefTraced(initialValue, traceOptions)
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return React.useRef(initialValue)
  }
}

const useRefTraced = <T>(
  initialValue?: T,
  traceOptions?: UseRefTraceOptions<T>,
): MutableRefObject<T | undefined> | RefObject<T | undefined> => {
  const traceOrigin = componentRegistry.registerHook('ref', traceOptions?.label)
  const componentLabel = componentRegistry.getCurrentComponentLabel()
  const componentInfo = getCurrentComponentInfo()

  const showDefinedValue = traceOptions?.showValue ?? ((s: T) => JSON.stringify(s))

  const showValue = util.showWithUndefined(showDefinedValue)

  hookUtil.useRunOnFirstRender(() => {
    traceOrigin.info = showValue(initialValue)
    tracer.trace(componentLabel, traceOrigin, 'init', { value: initialValue, show: showValue })
  })

  const tracedMutableRefObject = mkTracedMutableRefObject(initialValue, (newValue) => {
    traceOrigin.info = showValue(newValue)
    tracer.trace(componentLabel, traceOrigin, 'set', { value: newValue, show: showValue })
    componentInfo.refreshTracePanelRef.current?.()
  })

  const tracedRefRef = React.useRef(tracedMutableRefObject)

  return tracedRefRef.current
}

/**
 * Create a `MutableRefObject` that calls `onChange` whenever the `current` property is set to a new value.
 */
const mkTracedMutableRefObject = <T>(
  initialValue: T,
  onChange: (newValue: T) => void,
): MutableRefObject<T> => {
  const refObject = {
    __current: initialValue,
    set current(newValue: T) {
      const previousValue = this.__current
      this.__current = newValue
      if (newValue !== previousValue) {
        onChange(newValue)
      }
    },
    get current(): T {
      return this.__current
    },
  }
  return refObject
}
