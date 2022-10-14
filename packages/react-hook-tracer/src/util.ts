export const getObjectKeys = <Key extends string>(o: Record<Key, unknown>): Key[] =>
  Object.keys(o) as unknown as Key[]

export const clip = (min: number, max: number, n: number) => Math.max(min, Math.min(n, max))

// Type guard to narrow `value` to `T` if `values` is in `values`.
export const isIncluded = <T extends Wide, Wide>(values: readonly T[], value: Wide): value is T =>
  widenArray<T, Wide>(values).includes(value)

// Type-safe widening for arrays, so we don't have to use `as` or declare a `const wideArray: readonly Wide[] = array`.
export const widenArray = <T extends Wide, Wide>(array: readonly T[]): readonly Wide[] => array

export const showPropValue = (_propKey: string, value: unknown): string => {
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
    case 'function':
      return '<function>'
    case 'object': {
      return value === null ? 'null' : '<object>'
    }
  }
}

export const showProps = (
  props: Record<string, unknown>,
  showPropValue: (propKey: string, propValue: unknown) => string,
): string => {
  const keys = getObjectKeys(props)

  return keys.length === 0
    ? '<no props>'
    : keys.map((key) => `${key}=${showPropValue(key, props[key])}`).join(' ')
}
