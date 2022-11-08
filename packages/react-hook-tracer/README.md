# React-hook-tracer [![Npm version](https://img.shields.io/npm/v/react-hook-tracer.svg?style=flat)](https://www.npmjs.com/package/react-hook-tracer) [![Build status](https://img.shields.io/github/workflow/status/Oblosys/react-hook-tracer/Build%20and%20run%20tests/main)](https://github.com/Oblosys/react-hook-tracer/actions/workflows/build-test.yml?query=branch/main)

The [react-hook-tracer package](https://www.npmjs.com/package/react-hook-tracer) traces function components to reveal the order of hook-function calls and lifecycle events in an interactive trace-log component. It also provides a live view of a component's props, state, and refs directly inside its renderering. The functionality is similar to what [react-lifecycle-visualizer](https://github.com/Oblosys/react-lifecycle-visualizer#readme) does for class components.

The demo below shows a traced `UserList` component that uses an effect to load two `User` components, which each have local state to keep track of button clicks. Newly added users get an index that is kept in the `newUserId` ref. The purple panels in the components and the trace log on the right-hand side are created by the package.

<p align="center">
  <a href="https://codesandbox.io/s/github/Oblosys/react-hook-tracer/tree/demo/apps/react-hook-tracer-demo?file=/src/demos/Demo.tsx">
    <img
      alt="User-list demo screen capture"
      src="https://raw.githubusercontent.com/Oblosys/asset-storage/react-hook-tracer/images/user-list-demo.gif"
      width="830"
    />
  </a>
</p>

To trace a function component, simply import the hooks from `'react-hook-tracer'` instead of `'react'`, and call `useTracer()` at the start of the function. The `useTracer` hook returns a `TracePanel` component that can be included in the rendering to show the component's hooks, as well as the current values for its state, props, and refs. A global `TraceLog` component will show the trace messages, and when hovered over will highlight the traced hook in the corresponding `TracePanel`. The package currently supports tracing for `useCallback`, `useContext`, `useEffect`, `useInsertionEffect`, `useLayoutEffect`, `useMemo`, `useReducer`, `useRef`, and `useState`.

Note that even though tracing is disabled on production builds, it is not advisable to use react-hook-tracer on production.

### Demo

The demo above is live on a [CodeSandbox playground](https://codesandbox.io/s/github/Oblosys/react-hook-tracer/tree/demo/apps/react-hook-tracer-demo?file=/src/demos/Demo.tsx), and can be run locally with:

```sh
> git clone git@github.com:Oblosys/react-hook-tracer
> cd react-hook-tracer
> yarn install
> yarn build-lib
> yarn start
```

### Setup

Follow these steps to add tracing to a project.

#### Installation

Install the package with npm (or yarn):

```sh
> npm install react-hook-tracer
```

#### Include `TraceLog` component

The optional `TraceLog` component can be included anywhere in the application, but it probably makes the most sense to keep it near the root.

```tsx
import { TraceLog } from 'react-hook-tracer'
..
export const App = (): JSX.Element => (
  <div className="app">
    <RootComponent />
    <TraceLog />
  </div>
)
```

If the `TraceLog` is omitted, traces will get logged to the console instead (see [Tracing to the browser console](#tracing-to-the-browser-console)).

#### Tracing a component

To illustrate how to trace a component, consider this simple `Counter` component:

```tsx
import { useState } from 'react'

const Counter = ({ title }: { title: string }) => {
  const [n, setN] = useState(0)
  return (
    <div className="counter">
      <b>{title}</b>
      <span>
        Value of n: {n}
        <input type="button" value="Inc n" onClick={() => setN((prev) => prev + 1)} />
      </span>
    </div>
  )
}
```

Rendering the component with `<Counter title="Trace test" />` yields:

<p align="center">
  <img
    alt="Counter component"
    src="https://raw.githubusercontent.com/Oblosys/asset-storage/react-hook-tracer/images/counter-component.png"
    width="132"
  />
</p>

To trace this component, import any hook functions (here only `useState`) from `'react-hook-tracer'`, together with the `useTracer` hook, and insert `const { TracePanel } = useTracer()` at the start of the component function. Traced hooks accept an optional argument to add a custom label, so we will also pass `{ label: 'n' }` to `useState`. The `TracePanel` component returned by `useTracer` is included in the rendering:

```tsx
import { useState, useTracer } from 'react-hook-tracer' // Update import

const Counter = ({ title }: { title: string }) => {
  const { TracePanel } = useTracer() // Call useTracer at the start
  const [n, setN] = useState(0, { label: 'n' }) // Add custom label (optional)
  return (
    <div className="counter">
      <b>{title}</b>
      <span>
        Value of n: {n}
        <input type="button" value="Inc n" onClick={() => setN((prev) => prev + 1)} />
      </span>
      <TracePanel /> {/* Include TracePanel in rendering */}
    </div>
  )
}
```

Now the rendering of `<Counter title="Trace test" />` together with the trace log will look like this:

<p align="center">
  <img
    alt="Traced Counter component"
    src="https://raw.githubusercontent.com/Oblosys/asset-storage/react-hook-tracer/images/counter-component-traced.png"
    width="730"
  />
</p>

To experiment with this example, open the [CodeSandbox playground at `/src/demos/Counter.tsx`](https://codesandbox.io/s/github/Oblosys/react-hook-tracer/tree/demo/apps/react-hook-tracer-demo?file=/src/demos/Counter.tsx) and select 'Counter' instead of 'Demo' in the running app.

Note that traces are generated only by hooks imported from `'react-hook-tracer'`, and only for the calls that follow a `useTracer` call. Regular React hook calls following `useTracer` call do not generate traces, and neither do traced-hook calls in components without a `useTracer` call.

Besides `TracePanel`, `useTracer` also returns a function `trace: (message: string) => void`, which can be used to log custom trace messages.

#### Alternative import

Instead of using a named import, `'react-hook-tracer'` can also be imported as a variable, e.g. `traced`. Hooks can then be traced by prefixing each one with `traced.`:

```tsx
import { useTracer } from 'react-hook-tracer'
import * as traced from 'react-hook-tracer'

const Counter = ({ title }: { title: string }) => {
  const { TracePanel } = useTracer()
  const [n, setN] = traced.useState(0, { label: 'n' })
  return (
    ..
  )
}
```

#### React strict mode

<!-- Keep title in sync with link in packages/react-hook-tracer/src/components/StrictModeWarning.tsx -->

You may want to temporarily disable [React strict mode](https://reactjs.org/docs/strict-mode.html) by removing the `<React.StrictMode>` tags (typically in the root `index.tsx` or `index.jsx` file). In development builds, strict mode executes each component render twice, and also mounts components twice, which makes the log harder to read.

### Tracing to the browser console

To enable tracing to the browser console, leave out the `TraceLog` component, or call `setTracerConfig` anywhere in your project:

```ts
setTracerConfig({ shouldTraceToConsole: true })
```

Instead of a string representation, console traces show the actual object values for props, state, and refs, which means they can be expanded to inspect properties:

<p align="center">
  <img
    alt="Console traces"
    src="https://raw.githubusercontent.com/Oblosys/asset-storage/react-hook-tracer/images/console-traces.png"
    width="560"
  />
</p>

Console traces may also be useful to diagnose infinite render loops, since the trace log will not update in that case as it is itself a React component. To see what the console traces look like, check out the [CodeSandbox demo](https://codesandbox.io/s/github/Oblosys/react-hook-tracer/tree/demo/apps/react-hook-tracer-demo?file=/src/demos/Demo.tsx), which has a checkbox to control console tracing.

### The `useTracer` hook

The `useTracer` hook should be called at the start of the traced component, and returns a record containing the `TracePanel` component and a `trace` function:

```ts
useTracer: (options?: { showProps?: ShowProps }) => { trace: (message: string) => void, TracePanel: () => JSX.Element }
```

The `TracePanel` component can be included in the rendering, and `trace` can be used to emit custom traces to the trace log.

To override how prop values are displayed in the trace log, `useTracer` takes an optional `showProps: ShowProps` argument:

```ts
type ShowProps<Props = Record<string, any>> = {
  [K in keyof Props]?: (propValue: Props[K]) => string
}
```

This can be useful for object prop values, which are stringified by default. For example, if we have a `User` component that takes these props:

```ts
interface UserProps {
  user: { name: string; color: string }
  count: number
}
```

The trace log will contain entries like `render props: user={"name":"Stimpy","color":"red"} count=1`, which could be made more concise by declaring an override for prop `user`:

```ts
const showProps: ShowProps<UserProps> = { user: ({ name, color }) => `<<${name}:${color}>>` }
```

and in the `User` component call `useTracer({ showProps })`.

Now the log will contain entries like this: `render props: user=<<Stimpy:red>> count=1`.

### List of traced hooks

All traced hooks accept an optional configuration argument, which can be used to specify a custom label that will appear in the trace log and panels. For hooks that keep track of a value, a custom `show` function can be specified as well.

| Hook                 | Shorthand     | Optional configuration argument                         |
| -------------------- | ------------- | ------------------------------------------------------- |
| `useContext`         | `'context'`   | `{label?: string, show?: (contextValue: T) => string}`  |
| `useMemo`            | `'memo'`      | `{label?: string, show?: (memoizedValue: T) => string}` |
| `useReducer`         | `'reducer'`   | See interface `UseReducerTraceOptions` below.           |
| `useRef`             | `'ref'`       | `{label?: string, show?: (refValue: T) => string}`      |
| `useState`           | `'state'`     | `{label?: string, show?: (state: S) => string}`         |
| `useCallback`        | `'callback'`  | `{label?: string}`                                      |
| `useEffect`          | `'effect'`    | `{label?: string}`                                      |
| `useInsertionEffect` | `'insertion'` | `{label?: string}`                                      |
| `useLayoutEffect`    | `'layout'`    | `{label?: string}`                                      |

```ts
interface UseReducerTraceOptions<S, A> {
  label?: string
  showState?: (state: S) => string
  showAction?: (state: A) => string
}
```

### Trace-log message overview

Hooks have different phases in which traces are emitted. The overview below shows all possible phases for each hook.

#### Hooks with values

| Hook         | Phase      | Appearance in trace log                                                           |
| ------------ | ---------- | --------------------------------------------------------------------------------- |
| `useContext` | `init`     | On the first render, at the `useContext` call.                                    |
|              | `update`   | Whenever the context value changes.                                               |
| `useMemo`    | `init`     | On the first render, at the `useMemo` call.                                       |
|              | `refresh`  | Whenever the memoized value is recomputed due to changes in the dependencies.     |
| `useReducer` | `init`     | On the first render, at the `useReducer` call.                                    |
|              | `dispatch` | When dispatching an action, shows the action.                                     |
|              | `state`    | Immediately after a reduction step, shows the updated state.                      |
| `useRef`     | `init`     | On the first render, at the `useRef` call.                                        |
|              | `set`      | Whenever the ref value changes (even if no component re-renders).                 |
| `useState`   | `init`     | On the first render, at the `useState` call.                                      |
|              | `set`      | When setting the state to a value.                                                |
|              | `update`   | When setting the state with an update function (i.e `setState(prevState => ..)`). |

#### Hooks without values

| Hook                 | Phase     | Appearance in trace log                                            |
| -------------------- | --------- | ------------------------------------------------------------------ |
| `useCallback`        | `init`    | On the first render, at the `useCallback` call.                    |
|                      | `run`     | When the callback gets called                                      |
|                      | `refresh` | When a new callback is created due to changes in the dependencies. |
| `useEffect`          | `init`    | On the first render, at the `useEffect` call.                      |
|                      | `run`     | Before the effect runs.                                            |
|                      | `cleanup` | Before the effect's cleanup function gets called.                  |
| `useInsertionEffect` | `init`    | On the first render, at the `useInsertionEffect` call.             |
|                      | `run`     | Before the effect runs.                                            |
| `useLayoutEffect`    | `init`    | On the first render, at the `useLayoutEffect` call.                |
|                      | `run`     | Before the effect runs.                                            |

#### Lifecycle events & `trace`

Even though function components don't have a traditional lifecycle like class components, traced components will emit traces on certain lifecycle events.

| Event      | Appearance in trace log                                    |
| ---------- | ---------------------------------------------------------- |
| `mounting` | Just before the component begins to mount.                 |
| `mounted`  | When the component has mounted.                            |
| `render`   | At the start of each render, also shows the current props. |
| `trace`    | When the custom `trace` function gets called.              |
| `unmount`  | Just before the component unmounts.                        |

### Upcoming features

- For hooks with dependencies, show which dependencies changed.
- A configuration component to replace `setTracerConfig`.
- JSDoc comments for exported hooks.
- Maybe: Show render count in log and panel.
