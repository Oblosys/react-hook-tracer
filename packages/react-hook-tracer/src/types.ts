export type AssertNever<_T extends never> = never

export interface TraceOrigins {
  mount: TraceOrigin
  render: TraceOrigin
  trace: TraceOrigin
  unmount: TraceOrigin
  hooks: TraceOrigin[]
}

export type HookType = 'callback' | 'effect' | 'state'

export type TraceOriginType = 'mount' | 'render' | 'trace' | 'unmount' | HookType

export interface TraceOrigin {
  originType: TraceOriginType
  info: string | null // Mutable property. Is shown next to the originType in the HookPanel (e.g. for current state).
}
export const mkTraceOrigin = (originType: TraceOriginType): TraceOrigin => ({
  originType,
  info: null,
})

export interface LogEntry {
  label: string
  origin: TraceOrigin
  phase?: string // e.g to show 'state' log entries as 'init', 'set', etc.
  message?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ShowProps<Props = Record<string, any>> = {
  [K in keyof Props]?: (propValue: Props[K]) => string
}
