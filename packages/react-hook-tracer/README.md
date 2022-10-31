# React-hook-tracer [![Npm version](https://img.shields.io/npm/v/react-hook-tracer.svg?style=flat)](https://www.npmjs.com/package/react-hook-tracer) [![Build status](https://img.shields.io/github/workflow/status/Oblosys/react-hook-tracer/Build%20and%20run%20tests/main)](https://github.com/Oblosys/react-hook-tracer/actions/workflows/build-test.yml?query=branch/main)

The [`react-hook-tracer` package](https://www.npmjs.com/package/react-hook-tracer) traces function components to reveal the order of hook-function calls and lifecycle events in an interactive trace-log component. It also provides a live view of a component's props, state, and refs directly inside its renderering. The functionality is similar to what [`react-lifecycle-visualizer`](https://github.com/Oblosys/react-lifecycle-visualizer#readme) does for class components.

The demo below shows a traced `UserList` component that uses an effect to load two `User` components, which each have local state to keep track of button clicks. Newly added users get an index that is kept in the `newUserId` ref. The purple panels in the components and the trace log on the right-hand side are created by the package.

<p align="center">
  <a href="https://codesandbox.io/s/github/Oblosys/react-hook-tracer/tree/demo/apps/react-hook-tracer-demo?file=/src/demos/Demo.tsx">
    <img
      alt="User-list demo screen capture"
      src="https://raw.githubusercontent.com/Oblosys/react-hook-tracer/main/images/user-list-demo.gif"
      width="900"
    />
  </a>
</p>

To trace a function component, simply import the hooks from `react-hook-tracer` instead of `react`, and call `useTracer()` at the start of the function. The `useTracer` hook returns a `TracePanel` component that can be included in the rendering to show the component's hooks, as well as the current values for its state, props, and refs. A global `TraceLog` component will show the trace messages, and when hovered over will highlight the traced hook in the corresponding `TracePanel`.

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

#### Optionally disable React strict mode

You may want to temporarily disable [React strict mode](https://reactjs.org/docs/strict-mode.html) by removing the `<React.StrictMode>` tags (typically in the root `index.tsx` or `index.jsx` file). In development builds, strict mode executes each component render twice, and also mounts components twice, which makes the log harder to read.

#### Include `TraceLog` component

The `TraceLog` component can be included anywhere in the application, but it probably makes the most sense to keep it near the root.

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

The trace log can also be omitted, in which case traced components just show the used hooks as well as props, state, and refs, without the highlight feature.

#### Tracing a component

To illustrate what needs to be done to trace a component, consider this simple `Sample` component:

```tsx
import { useState } from 'react'

const Sample = ({ title }: { title: string }) => {
  const [n, setN] = useState(0)
  return (
    <div className="sample">
      <b>{title}</b>
      <span>
        Value of n: {n}
        <input type="button" value="Inc n" onClick={() => setN((prev) => prev + 1)} />
      </span>
    </div>
  )
}
```

Rendering this component with `<Sample title="Trace test" />` yields:

<p align="center">
  <img
    alt="Sample component"
    src="https://raw.githubusercontent.com/Oblosys/react-hook-tracer/main/images/sample-component.png"
    width="132"
  />
</p>

To add tracing, import any hook functions (here only `useState`) from `react-hook-tracer`, together with the `useTracer` hook, and insert `const { TracePanel } = useTracer()` at the start of the component function. Traced hooks take an optional extra argument to add a custom label, so we can pass `{ label: 'n' }` to `useState`. The `TracePanel` component from `useTracer` can be included in the rendering:

```tsx
import { useState, useTracer } from 'react-hook-tracer'

const Sample = ({ title }: { title: string }) => {
  const { TracePanel } = useTracer()
  const [n, setN] = useState(0, { label: 'n' })
  return (
    <div className="sample">
      <b>{title}</b>
      <span>
        Value of n: {n}
        <input type="button" value="Inc n" onClick={() => setN((prev) => prev + 1)} />
      </span>
      <TracePanel />
    </div>
  )
}
```

Now the rendering of `<Sample title="Trace test" />` together with the trace log will look like this:

<p align="center">
  <img
    alt="Traced Sample component"
    src="https://raw.githubusercontent.com/Oblosys/react-hook-tracer/main/images/sample-component-traced.png"
    width="900"
  />
</p>

Hooks imported from `react-hook-tracer` can also be used in untraced components (i.e. without a `useTracer` call), in which case they behave as regular React hooks. It is also possible to use regular React hooks in traced components, to hide them from the panels and the log.

Besides `TracePanel`, `useTracer` also returns a function `trace: (message: string) => void`, which can be used to log custom trace messages.

#### Alternative import

Instead of using a named import, `react-hook-tracer` can also be imported as a variable, e.g. `traced`. Hooks can then be traced by prefixing each one with `traced.`:

```tsx
import { useTracer } from 'react-hook-tracer'
import * as traced from 'react-hook-tracer'

const Sample = ({ title }: { title: string }) => {
  const { TracePanel } = useTracer()
  const [n, setN] = traced.useState(0, { label: 'n' })
  return (
    ..
  )
}
```

### Trace-log message overview

**Hooks with values**

| Hook       | Phase    | Appearance in trace log                                                           |
| ---------- | -------- | --------------------------------------------------------------------------------- |
| `useState` | `init`   | On the first render, at the `useState` call.                                      |
|            | `set`    | When setting the state to a value.                                                |
|            | `update` | When setting the state with an update function (i.e `setState(prevState => ..)`). |
| `useRef`   | `init`   | On the first render, at the `useRef` call.                                        |
|            | `set`    | Whenever the ref value changes (even if no component re-renders).                 |

**Hooks without values**

| Hook                 | Phase     | Appearance in trace log                                            |
| -------------------- | --------- | ------------------------------------------------------------------ |
| `useEffect`          | `init`    | On the first render, at the `useEffect` call.                      |
|                      | `run`     | Before the effect runs.                                            |
|                      | `cleanup` | Before the effect's cleanup function gets called.                  |
| `useCallback`        | `init`    | On the first render, at the `useCallback` call.                    |
|                      | `run`     | When the callback gets called                                      |
|                      | `refresh` | When a new callback is created due to changes in the dependencies. |
| `useLayoutEffect`    | `init`    | On the first render, at the `useLayoutEffect` call.                |
| `useInsertionEffect` | `init`    | On the first render, at the `useInsertionEffect` call.             |

**Lifecycle events & `trace`**

| Event     | Appearance in trace log                       |
| --------- | --------------------------------------------- |
| `mount`   | When the component mounts.                    |
| `render`  | At the start of each render.                  |
| `trace`   | When the custom `trace` function gets called. |
| `unmount` | Just before the component unmounts.           |

### Coming soon

- Tracing to the browser console.
- Trace support for `useContext`, `useReducer`, and maybe more hooks.
