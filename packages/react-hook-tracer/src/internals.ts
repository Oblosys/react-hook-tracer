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
  // pendingProps: any // This type will be more specific once we overload the tag.
  // memoizedProps: any // The props used to create the output.

  // // The state used to create the output
  // memoizedState: any

  // // Dependencies (contexts, events) for this fiber, if it has any
  // dependencies: Dependencies | null
}

export const getCurrentOwner = (): Fiber | null =>
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner.current

export const getComponentLabel = (): string => {
  const currentOwner = getCurrentOwner()
  const { label } = getFiberNodeInfo(currentOwner)
  return label
}

interface Info {
  name: string
  id: number
  label: string
}

const fiberNodes = new WeakMap<Fiber, Info>()
let idCounter = 0 // TODO: counters per name

const getFiberNodeInfo = (n: Fiber | null): Info => {
  if (n === null) {
    return { name: '<unknown>', id: 0, label: '<unknown>-0' }
  }
  const info = fiberNodes.get(n)
  if (info !== undefined) {
    return info
  } else {
    const alternateInfo = n.alternate && fiberNodes.get(n.alternate)
    if (alternateInfo) {
      return alternateInfo
    } else {
      const newInfo = { name: n.type.name, id: idCounter, label: `${n.type.name}-${idCounter}` }
      fiberNodes.set(n, newInfo)
      // console.log(`New fiberNode ${newInfo.label}`, n)
      idCounter += 1

      return newInfo
    }
  }
}
