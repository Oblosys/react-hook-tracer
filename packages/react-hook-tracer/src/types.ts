export type AssertNever<_T extends never> = never

export interface ComponentInfo {
  name: string
  id: number
  componentLabel: string
  nextHookIndex: number // Mutable property
  traceOrigins: TraceOrigins // Mutable object
}

export interface TraceOrigins {
  mount: TraceOrigin
  render: TraceOrigin
  trace: TraceOrigin
  unmount: TraceOrigin
  hooks: TraceOrigin[]
}

type LifecycleEvent = 'mount' | 'render' | 'trace' | 'unmount'
export type HookType = 'callback' | 'effect' | 'insertion' | 'layout' | 'state'

export type TraceOriginType = LifecycleEvent | HookType

export interface TraceOrigin {
  originType: TraceOriginType
  label: string | null
  info: string | null // Mutable property. Is shown next to the originType in the TracePanel (e.g. for current state).
}
export const mkTraceOrigin = (originType: TraceOriginType, label?: string): TraceOrigin => ({
  originType,
  label: label ?? null,
  info: null,
})

export type Phase =
  | 'cleanup'
  | 'init'
  | 'mounted'
  | 'mounting'
  | 'refresh'
  | 'run'
  | 'set'
  | 'update'

export interface LogEntry {
  componentLabel: string
  origin: TraceOrigin
  phase?: Phase // e.g to show 'state' log entries as 'init', 'set', etc.
  message?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ShowProps<Props = Record<string, any>> = {
  [K in keyof Props]?: (propValue: Props[K]) => string
}
