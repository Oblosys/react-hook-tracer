import React from 'react'

import * as reactDevTools from './reactDevTools'
import { ComponentInfo, HookType, TraceOrigin, TraceOrigins, mkTraceOrigin } from './types'
declare module 'react' {
  const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    ReactCurrentOwner: { current: FiberNode | null }
  }
}

// See `Fiber` at https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactInternalTypes.js
// React uses interface Fiber for class FiberNode, but we'll just use FiberNode to avoid confusion when logging.
export interface FiberNode {
  // // Tag identifying the type of fiber.
  // tag: WorkTag // Should be 0 or 2
  // See `WorkTag` at https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactInternalTypes.js
  //   const FunctionComponent = 0;
  //   const ClassComponent = 1;
  //   const IndeterminateComponent = 2; // Before we know whether it is function or class

  // The resolved function/class/ associated with this fiber.
  type: { name: string } // TODO: check whether type is fn first.

  // This is a pooled version of a Fiber. Every fiber that gets updated will
  // eventually have a pair. There are cases when we can clean up pairs to save
  // memory if we need to.
  alternate: FiberNode | null

  // // Input is the data coming into process this fiber. Arguments. Props.
  pendingProps: Record<string, unknown> // This type will be more specific once we overload the tag.
  memoizedProps: Record<string, unknown> // The props used to create the output.

  // // The state used to create the output
  memoizedState: Record<string, unknown>

  // // Dependencies (contexts, events) for this fiber, if it has any
  // dependencies: Dependencies | null
}

const getCurrentOwner = (): FiberNode | null =>
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner.current

export const getCurrentPendingProps = () => getCurrentOwner()?.pendingProps ?? {}

const nextComponentIdByComponentName: Record<string, number> = {}
const getFreshIdForComponentName = (name: string) => {
  if (nextComponentIdByComponentName[name] === undefined) {
    nextComponentIdByComponentName[name] = 1
  }
  const id = nextComponentIdByComponentName[name]
  nextComponentIdByComponentName[name] += 1
  return id
}

// Clear the id counters for new components. Only to be used for testing.
// TODO: Maybe create an initialize function, and also group mutable constants.
export const resetNextComponentIds = () => {
  for (const key in nextComponentIdByComponentName) {
    delete nextComponentIdByComponentName[key]
  }
}

const componentInfoMap = new WeakMap<FiberNode, ComponentInfo>()

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

const mkTraceOrigins = (): TraceOrigins => ({
  mount: mkTraceOrigin('mount'),
  render: mkTraceOrigin('render'),
  trace: mkTraceOrigin('trace'),
  unmount: mkTraceOrigin('unmount'),
  hooks: [],
})

const mkComponentInfoForComponentName = (name: string): ComponentInfo => {
  const id = getFreshIdForComponentName(name)
  return {
    name,
    id,
    componentLabel: `${name}-${id}`,
    nextHookIndex: 0,
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
export const registerHook = (hookType: HookType): TraceOrigin => {
  const componentInfo = getCurrentComponentInfoOrThrow('registerHook: no current owner')
  const { nextHookIndex, traceOrigins } = componentInfo

  const previouslyRegisteredHook = traceOrigins.hooks[nextHookIndex]
  if (previouslyRegisteredHook === undefined) {
    traceOrigins.hooks[nextHookIndex] = mkTraceOrigin(hookType)
  } else {
    const previousHookType = previouslyRegisteredHook.originType
    if (previousHookType !== hookType) {
      // Either Rules of Hooks were broken or we enccountered an internal error.
      // (can this also happen when adding/removing hooks with hot reload?)
      console.error(
        `The ${hookType} hook at index ${nextHookIndex} was previously registered as ${previousHookType} hook`,
      )
      // TODO: throw
    }
  }

  const traceOrigin = traceOrigins.hooks[nextHookIndex]
  componentInfo.nextHookIndex += 1
  return traceOrigin
}
