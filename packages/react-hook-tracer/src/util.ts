export const getObjectKeys = <Key extends string>(o: Record<Key, unknown>): Key[] =>
  Object.keys(o) as unknown as Key[]

export const clip = (min: number, max: number, n: number) => Math.max(min, Math.min(n, max))

// Type guard to narrow `value` to `T` if `values` is in `values`.
export const isIncluded = <T extends Wide, Wide>(values: readonly T[], value: Wide): value is T =>
  widenArray<T, Wide>(values).includes(value)

// Type-safe widening for arrays, so we don't have to use `as` or declare a `const wideArray: readonly Wide[] = array`.
export const widenArray = <T extends Wide, Wide>(array: readonly T[]): readonly Wide[] => array
