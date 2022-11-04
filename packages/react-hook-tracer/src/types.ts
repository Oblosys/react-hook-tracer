import { MutableRefObject } from 'react'

export type AssertNever<_T extends never> = never

export interface ComponentInfo {
  name: string
  id: number
  componentLabel: string
  nextHookIndex: number // Mutable property
  refreshTracePanelRef: MutableRefObject<(() => void) | null>
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
// NOTE: 'mount' gets logged as 'mounting' or 'mounted' based on the phase, as we don't want to clutter trace panels
// with separate origin types for mounting and mounted.

export type HookType =
  | 'callback'
  | 'context'
  | 'effect'
  | 'insertion'
  | 'layout'
  | 'memo'
  | 'reducer'
  | 'ref'
  | 'state'

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
  | 'action'
  | 'cleanup'
  | 'init'
  | 'mounted'
  | 'mounting'
  | 'refresh'
  | 'run'
  | 'set'
  | 'state'
  | 'update'
  | 'props'

export interface LogEntry {
  componentLabel: string
  origin: TraceOrigin
  phase?: Phase // e.g to show 'state' log entries as 'init', 'set', etc.
  message?: string
}

export interface TracerConfig {
  traceToConsole?: boolean
}

export interface TracerConfig {
  traceToConsole?: boolean
}

// Can't use unknown because of contravariance in show-function parameters, and never is incorrect for non-generic use.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ShowProps<Props = Record<string, any>> = {
  [K in keyof Props]?: (propValue: Props[K]) => string
}
