export const getObjectKeys = <Key extends string>(o: Record<Key, unknown>): Key[] =>
  Object.keys(o) as unknown as Key[]

export const clip = (min: number, max: number, n: number) => Math.max(min, Math.min(n, max))
