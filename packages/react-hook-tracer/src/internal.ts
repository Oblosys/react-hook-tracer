import React from 'react'

declare module 'react' {
  const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    ReactCurrentOwner: { current: Fiber | null }
  }
}

/*
FiberNode {
  _debugHookTypes: Array(4) [ "useRef", "useEffect", "useRef", … ]
  <prototype>: Array []
  _debugNeedsRemount: false
  _debugOwner: Object { tag: 0, key: null, index: 0, … }
  _debugSource: Object { fileName: "/Users/martijn/git/React/react-hook-tracer/src/App.tsx", lineNumber: 30, columnNumber: 21 }
  actualDuration: 0
  actualStartTime: 132
  alternate: null
  child: Object { tag: 5, elementType: "div", type: "div", … }
  childLanes: 0
  deletions: null
  dependencies: null
  elementType: function Counter(props)
  flags: 42993665
  index: 3
  key: null
  lanes: 0
  memoizedProps: Object { p: "Inky" }
  memoizedState: Object { memoizedState: {…}, baseState: null, baseQueue: null, … }
  mode: 27
  pendingProps: Object { p: "Inky" }
  ref: null
  return: Object { tag: 5, elementType: "div", type: "div", … }
  selfBaseDuration: 0
  sibling: Object { tag: 0, key: null, index: 4, … }
  stateNode: null
  subtreeFlags: 1048576
  tag: 0
  treeBaseDuration: 0
  type: function Counter(props)
  updateQueue: Object { lastEffect: {…}, stores: null }
  <prototype>: Object { … }
}
*/

// TODO: Rename to FiberNode, like the actual object
// See `Fiber` at https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactInternalTypes.js
export interface Fiber {
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
  alternate: Fiber | null

  // // Input is the data coming into process this fiber. Arguments. Props.
  pendingProps: Record<string, unknown> // This type will be more specific once we overload the tag.
  memoizedProps: Record<string, unknown> // The props used to create the output.

  // // The state used to create the output
  memoizedState: Record<string, unknown>

  // // Dependencies (contexts, events) for this fiber, if it has any
  // dependencies: Dependencies | null
}

export const getCurrentOwner = (): Fiber | null =>
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

interface Info {
  name: string
  id: number
  label: string
  nextHookIndex: number // Mutable
  registeredHooks: string[] // Array is mutable
}

const componentInfoMap = new WeakMap<Fiber, Info>()

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

const createComponentInfo = (currentOwner: Fiber) => {
  const name = currentOwner.type.name
  const id = getFreshIdForName(name)
  return {
    name,
    id,
    label: `${name}-${id}`,
    isTraced: false,
    nextHookIndex: 0,
    registeredHooks: [],
  }
}

const getComponentInfo = (currentOwner: Fiber): Info => {
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
    const newComponentInfo = createComponentInfo(currentOwner)
    componentInfoMap.set(currentOwner, newComponentInfo)
    return newComponentInfo
  }
}

const getCurrentComponentInfoOrThrow = (message: string): Info => {
  const currentOwner = getCurrentOwner()
  if (currentOwner === null) {
    throw new Error(message)
  } else {
    return getComponentInfo(currentOwner)
  }
}

export const getCurrentComponentInfo = (): Info => {
  const componentInfo = getCurrentComponentInfoOrThrow('getCurrentComponentInfo: no current owner')
  return componentInfo
}

export const getCurrentComponentLabel = (): string => {
  const componentInfo = getCurrentComponentInfoOrThrow('getCurrentComponentLabel: no current owner')
  return componentInfo.label
}

export const registerCurrentComponent = (): Info => {
  const componentInfo = getCurrentComponentInfoOrThrow('registerComponent: no current owner')

  componentInfo.nextHookIndex = 0

  return componentInfo
}

// Registered hooks will be stable due to Rules of Hooks.

export type HookType = 'state' | 'effect'

// TODO: Can we bind the actual state to state effects? and maybe dependencies to effect? (unnamed though)
// use array of objects, and return object on registration
export const registerHook = (hookType: HookType) => {
  const componentInfo = getCurrentComponentInfoOrThrow('registerHook: no current owner')
  const label = componentInfo.label
  const { nextHookIndex, registeredHooks } = componentInfo

  console.log(label, `${hookType} nextHookIndex`, nextHookIndex)

  const previouslyRegisteredHook = registeredHooks[nextHookIndex]
  if (previouslyRegisteredHook === undefined) {
    registeredHooks[nextHookIndex] = hookType
  } else {
    if (previouslyRegisteredHook !== hookType) {
      console.error(
        `The ${hookType} hook at index ${nextHookIndex} was previously registered as ${previouslyRegisteredHook} hook`,
      )
      // Either Rules of Hooks were broken or internal error
      // (can this also happen when adding/removing hooks with hot reload?)
    }
  }

  componentInfo.nextHookIndex += 1
}
