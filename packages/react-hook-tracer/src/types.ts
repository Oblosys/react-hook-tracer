export interface TraceOrigins {
  mount: TraceOrigin
  render: TraceOrigin
  trace: TraceOrigin
  unmount: TraceOrigin
  hooks: TraceOrigin[]
}

export type HookType = 'state' | 'effect'

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
  message?: string
  customOriginLabel?: string // e.g to show 'state' log entries as 'useState', 'setState', etc.
}
