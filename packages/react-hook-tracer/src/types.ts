// TODO: These are not all hook types
export type HookType = 'mount' | 'render' | 'state' | 'effect' | 'unmount'

export interface HookInfo {
  hookType: HookType
  info: string
}
