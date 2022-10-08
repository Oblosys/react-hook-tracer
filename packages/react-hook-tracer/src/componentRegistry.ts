import React from 'react'

import { HookType, TraceOrigin, TraceOrigins, mkTraceOrigin } from './types'

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

export const getCurrentOwner = (): FiberNode | null =>
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner.current

const nextComponentIdByLabel: Record<string, number> = {}
const getFreshIdForName = (name: string) => {
  if (nextComponentIdByLabel[name] === undefined) {
    nextComponentIdByLabel[name] = 1
  }
  const id = nextComponentIdByLabel[name]
  nextComponentIdByLabel[name] += 1
  return id
}

export interface ComponentInfo {
  name: string
  id: number
  label: string
  nextHookIndex: number // Mutable property
  traceOrigins: TraceOrigins // Mutable object
}

const componentInfoMap = new WeakMap<FiberNode, ComponentInfo>()

export const isCurrentComponentTraced = (): boolean => {
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

const mkComponentInfo = (currentOwner: FiberNode) => {
  const name = currentOwner.type.name
  const id = getFreshIdForName(name)
  return {
    name,
    id,
    label: `${name}-${id}`,
    isTraced: false,
    nextHookIndex: 0,
    traceOrigins: mkTraceOrigins(),
  }
}

const getComponentInfo = (currentOwner: FiberNode): ComponentInfo => {
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
    const newComponentInfo = mkComponentInfo(currentOwner)
    componentInfoMap.set(currentOwner, newComponentInfo)
    return newComponentInfo
  }
}

const getCurrentComponentInfoOrThrow = (message: string): ComponentInfo => {
  const currentOwner = getCurrentOwner()
  if (currentOwner === null) {
    throw new Error(message)
  } else {
    return getComponentInfo(currentOwner)
  }
}

export const getCurrentComponentInfo = (): ComponentInfo => {
  const componentInfo = getCurrentComponentInfoOrThrow('getCurrentComponentInfo: no current owner')
  return componentInfo
}

export const getCurrentComponentLabel = (): string => {
  const componentInfo = getCurrentComponentInfoOrThrow('getCurrentComponentLabel: no current owner')
  return componentInfo.label
}

export const registerCurrentComponent = (): ComponentInfo => {
  const componentInfo = getCurrentComponentInfoOrThrow('registerComponent: no current owner')

  componentInfo.nextHookIndex = 0

  return componentInfo
}

// For each component, registerHook will always be called in the same order due to Rules of Hooks.
export const registerHook = (hookType: HookType): TraceOrigin => {
  const componentInfo = getCurrentComponentInfoOrThrow('registerHook: no current owner')
  const { nextHookIndex, traceOrigins } = componentInfo

  // console.log(componentInfo.label, `${hookType} nextHookIndex`, nextHookIndex)

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
