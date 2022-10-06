// TODO: These are not all hook types. Maybe use TraceOrigin?
export type HookType = 'mount' | 'render' | 'state' | 'effect' | 'trace' | 'unmount'

export interface HookInfo {
  hookType: HookType
  info: string
}
export const mkHookInfo = (hookType: HookType): HookInfo => ({ hookType, info: '' })
