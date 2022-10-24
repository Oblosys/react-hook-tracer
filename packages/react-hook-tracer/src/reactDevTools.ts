import { ComponentInfo } from './types'

/**
 * When a component is selected in React DevTools it gets shallow rendered with stubbed hooks to establish which hooks
 * are used by the component. This means we need to render the component with exactly the same hook calls as during the
 * regular render.
 *
 * Since the render result is not used and only one component is rendered at a time, we can just return a dummy
 * ComponentInfo from registerComponent, store it in shallowRenderingComponentInfo and use it in
 * getCurrentComponentInfoOrThrow. Because the hooks are stubs, no tracing functionality gets run, except trace calls
 * outside hooks, which we silence in Tracer.trace.
 *
 * This solution works if all selected components are traced, but if an untraced component has traced hooks that call
 * isCurrentComponentTraced we need to be able to detect it is not traced and return false. Since there is no owner or
 * any other reference to determine which component is being rendered, we won't know at isCurrentComponentTraced whether
 * it is a hook called by the traced component, or by an untraced component that was rendered afterwards.
 *
 * Fortunately, React DevTools sets window.$r to the selected component fiber after rendering, so we can set this to
 * a marker string in registerComponent to denote a traced-component rendering is in progress, and it will automatically
 * get cleared before the next component is rendered.
 *
 * NOTE: Console is silenced during devTools shallow render, so use `const consoleLog = console.log` for logging.
 */

export const getIsRenderedByDevTools = () => {
  const callStack = new Error()?.stack ?? ''

  // Test the call-stack for a line containing both 'inspectElement' and 'react_devtools_backend.js'.
  // Checking for 'react_devtools_backend.js' alone is not enough as on a hot reload the stack may contain lines like:
  //   attach/renderer.scheduleRefresh@moz-extension://HASH/build/react_devtools_backend.js:6514:16

  // NOTE: This code is fairly hacky, but failures won't be critical. False positives will only occur on a hot reload
  // (fixed by a page refresh), whereas false negatives will only break DevTools inspection of traced components.
  return (
    callStack.match(/inspectElement.+react_devtools_backend\.js/) ||
    callStack.match(/react_devtools_backend\.js.+inspectElement/)
  )
}

const devToolsShallowRenderingMarker = 'DevTools is rendering a traced component'

export const getIsRenderingTracedComponent = () => window.$r === devToolsShallowRenderingMarker

declare global {
  interface Window {
    $r?: unknown
  }
}

export const setIsDevToolsRenderingTracedComponent = () => {
  window.$r = devToolsShallowRenderingMarker
}

const shallowRenderingComponentInfo: { current: ComponentInfo | null } = { current: null }

export const setCurrentComponentInfo = (componentInfo: ComponentInfo): void => {
  shallowRenderingComponentInfo.current = componentInfo
}

export const getCurrentComponentInfo = (): ComponentInfo => {
  if (shallowRenderingComponentInfo.current === null) {
    throw new Error(
      'ComponentInfo null while component is being shallow rendered by React DevTools.',
    )
  } else {
    return shallowRenderingComponentInfo.current
  }
}
