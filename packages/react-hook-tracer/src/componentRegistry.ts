import { componentIds } from './ComponentIds'
import { componentInfoMap } from './ComponentInfoMap'
import * as reactDevTools from './reactDevTools'
import { FiberNode, getCurrentOwner } from './reactInternals'
import { ComponentInfo, HookType, TraceOrigin, TraceOrigins, mkTraceOrigin } from './types'

export const resetComponentRegistry = (): void => {
  componentInfoMap.initialize()
  componentIds.initialize()
}

const mkTraceOrigins = (): TraceOrigins => ({
  mount: mkTraceOrigin('mount'),
  render: mkTraceOrigin('render'),
  trace: mkTraceOrigin('trace'),
  unmount: mkTraceOrigin('unmount'),
  hooks: [],
})

const mkComponentInfoForComponentName = (name: string): ComponentInfo => {
  const id = componentIds.getFreshIdForComponentName(name)
  return {
    name,
    id,
    componentLabel: `${name}-${id}`,
    nextHookIndex: 0,
    refreshTracePanelRef: { current: null },
    traceOrigins: mkTraceOrigins(),
  }
}

const mkDummyComponentInfo = () => mkComponentInfoForComponentName('DevToolsShallowRendered')

const mkComponentInfoForFiber = (currentOwner: FiberNode) =>
  mkComponentInfoForComponentName(currentOwner.type.name)

const getComponentInfoForFiber = (currentOwner: FiberNode): ComponentInfo => {
  const componentInfo = componentInfoMap.get(currentOwner)
  if (componentInfo !== undefined) {
    return componentInfo
  } else {
    if (currentOwner.alternate !== null) {
      const componentAlternateInfo = componentInfoMap.get(currentOwner.alternate)
      if (componentAlternateInfo !== undefined) {
        componentInfoMap.set(currentOwner, componentAlternateInfo)
        return componentAlternateInfo
      }
    }

    // Component was not registered, and either had no alternate or alternate wasn't registered.
    const newComponentInfo = mkComponentInfoForFiber(currentOwner)
    componentInfoMap.set(currentOwner, newComponentInfo)
    return newComponentInfo
  }
}

const getCurrentComponentInfoOrThrow = (message: string): ComponentInfo => {
  if (reactDevTools.getIsRenderedByDevTools()) {
    // Return the dummy componentInfo if the component is being rendered by React DevTools.
    return reactDevTools.getCurrentComponentInfo()
  }

  const currentOwner = getCurrentOwner()
  if (currentOwner === null) {
    throw new Error(message)
  } else {
    return getComponentInfoForFiber(currentOwner)
  }
}

export const getCurrentComponentInfo = (): ComponentInfo =>
  getCurrentComponentInfoOrThrow('getCurrentComponentInfo: no current owner')

export const getCurrentComponentLabel = (): string => {
  const componentInfo = getCurrentComponentInfoOrThrow('getCurrentComponentLabel: no current owner')
  return componentInfo.componentLabel
}

export const isCurrentComponentTraced = (): boolean => {
  if (reactDevTools.getIsRenderedByDevTools()) {
    return reactDevTools.getIsRenderingTracedComponent()
  }

  const currentOwner = getCurrentOwner()

  if (currentOwner === null) {
    throw new Error('isComponentTraced: no current owner')
  } else {
    return (
      componentInfoMap.has(currentOwner) ||
      (currentOwner.alternate !== null && componentInfoMap.has(currentOwner.alternate))
    )
  }
}

export const registerCurrentComponent = (): ComponentInfo => {
  if (reactDevTools.getIsRenderedByDevTools()) {
    // If the component is being rendered by React DevTools, create a dummy ComponentInfo to be used by subsequent
    // traced hook calls, and mark that we're currently shallow-rendering a traced component (mark will get cleared
    // after render).
    const componentInfo = mkDummyComponentInfo()
    reactDevTools.setCurrentComponentInfo(componentInfo)
    reactDevTools.setIsDevToolsRenderingTracedComponent()
    return componentInfo
  }
  const componentInfo = getCurrentComponentInfoOrThrow('registerComponent: no current owner')

  componentInfo.nextHookIndex = 0 // Reset nextHookIndex

  return componentInfo
}

// For each component, registerHook will always be called in the same order due to Rules of Hooks.
export const registerHook = (hookType: HookType, hookLabel?: string): TraceOrigin => {
  const componentInfo = getCurrentComponentInfoOrThrow('registerHook: no current owner')
  const { nextHookIndex, traceOrigins } = componentInfo

  const previouslyRegisteredHook = traceOrigins.hooks[nextHookIndex]
  if (previouslyRegisteredHook === undefined) {
    traceOrigins.hooks[nextHookIndex] = mkTraceOrigin(hookType, hookLabel)
  } else {
    const previousHookType = previouslyRegisteredHook.originType
    if (previousHookType !== hookType) {
      // Either Rules of Hooks were broken or we enccountered an internal error.
      throw new Error(
        `The ${hookType} hook at index ${nextHookIndex} was previously registered as ${previousHookType} hook`,
      )
    }
  }

  const traceOrigin = traceOrigins.hooks[nextHookIndex]
  componentInfo.nextHookIndex += 1
  return traceOrigin
}
