import * as types from './types'

// Declare `process` type in case we're not in a node environment.
declare const process: { env: { NODE_ENV?: string } }
export const isProductionBuild = (() => {
  try {
    return process.env.NODE_ENV === 'production'
  } catch {
    return false
  }
})()

export const isServerRendered = typeof window === 'undefined'

export const includes = <T>(xs: readonly T[], x: T): boolean => xs.indexOf(x) >= 0

export const flatMap = <T, S>(xs: readonly T[], f: (x: T) => readonly S[]): S[] =>
  Array.from<S>([]).concat(...xs.map(f))

export const getObjectKeys = <Key extends string>(o: Record<Key, unknown>): Key[] =>
  Object.keys(o) as unknown as Key[]

export const clip = (min: number, max: number, n: number) => Math.max(min, Math.min(n, max))

// Type guard to narrow `value` to `T` if `value` is an element of `values`.
export const isIncluded = <T extends Wide, Wide>(values: readonly T[], value: Wide): value is T =>
  includes(values, value)

// Type-safe widening for arrays, so we don't have to use `as` or declare a `const wideArray: readonly Wide[] = array`.
export const widenArray = <T extends Wide, Wide>(array: readonly T[]): readonly Wide[] => array

// Extend parameter function `show: (x: T) => string` to handle `undefined`.
export const showWithUndefined =
  <T>(show: (x: T) => string): ((x: T | undefined) => string) =>
  (x: T | undefined) =>
    x === undefined ? 'undefined' : show(x)

export const showValue = (value: unknown): string => {
  switch (typeof value) {
    case 'bigint':
    case 'boolean':
    case 'number':
    case 'string':
    case 'symbol': {
      return JSON.stringify(value)
    }
    case 'undefined': {
      return 'undefined'
    }
    case 'function': {
      return '<function>'
    }
    case 'object': {
      if (value === null) {
        return 'null'
      }
      // For DOM elements, toString is just fine.
      if (value instanceof HTMLElement) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return value.toString()
      }
      // For other objects, try to stringify first.
      try {
        return JSON.stringify(value)
      } catch (_error) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return value.toString()
      }
    }
  }
}

export const showProps = (
  props: Record<string, unknown>,
  showPropValue: (propKey: string, propValue: unknown) => string,
): string => {
  const propKeys = getObjectKeys(props)
  return propKeys.length === 0
    ? 'none'
    : propKeys.map((key) => `${key}=${showPropValue(key, props[key])}`).join(' ')
}

export const showPayload = <T>(payload: types.Payload<T>): string => {
  switch (payload.type) {
    case 'empty': {
      return ''
    }
    case 'string': {
      return payload.message
    }
    case 'value': {
      return payload.show(payload.value)
    }
  }
}

// Rewrite {originType: 'mount', phase: 'mounting'|'mounted' } to {originType: 'mounting'|'mounted', phase: undefined }
// to avoid logging 'mount mounting' and 'mount mounted'.
export const rewriteOriginTypeMount = (
  originType: types.TraceOriginType,
  phase: types.Phase | undefined,
) =>
  originType === 'mount' && (phase === 'mounting' || phase === 'mounted')
    ? { originType: phase, phase: undefined }
    : { originType, phase }
