import React from 'react'

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
  type: { name?: string; displayName?: string }

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

export const getCurrentPendingProps = () => getCurrentOwner()?.pendingProps ?? {}
