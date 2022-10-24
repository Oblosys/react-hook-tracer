# React-hook-tracer [![Npm version](https://img.shields.io/npm/v/react-hook-tracer.svg?style=flat)](https://www.npmjs.com/package/react-hook-tracer) [![Build status](https://img.shields.io/github/workflow/status/Oblosys/react-hook-tracer/Build%20and%20run%20tests/main)](https://github.com/Oblosys/react-hook-tracer/actions/workflows/build-test.yml?query=branch/main)

The [`react-hook-tracer` package](https://www.npmjs.com/package/react-hook-tracer) allows tracing function components to reveal the order of hook-function calls in an interactive trace-log component, and provides a live view of the component's props and state. The functionality is similar to what [`react-lifecycle-visualizer`](https://github.com/Oblosys/react-lifecycle-visualizer#readme) does for class components.

<p align="center">
  <a href="https://codesandbox.io/s/github/Oblosys/react-hook-tracer/tree/demo/apps/react-hook-tracer-demo?file=/src/Demo.tsx">
    <img
      alt="User-list demo screen capture"
      src="https://raw.githubusercontent.com/Oblosys/react-hook-tracer/main/images/user-list-demo.gif"
      width="600"
    />
  </a>
</p>

Function components can be traced by importing the hooks from `react-hook-tracer` instead of `react`, and calling `useTracer()` at the the start of the function. The `useTracer` hook returns a `TracePanel` component that can be included in the rendering to show the component's hooks, as well as its state and props. A global `TraceLog` component will show the trace messages, and when hovered over will highlight the traced hook in the corresponding `TracePanel`.

### Demo

The demo above is live on this [CodeSandbox playground](https://codesandbox.io/s/github/Oblosys/react-hook-tracer/tree/demo/apps/react-hook-tracer-demo?file=/src/Demo.tsx), and can be run locally with:

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

The `TraceLog` component can be included anywhere in the application, though it probaly makes the most sense to keep it near the root.

```typescript
import { TraceLog } from 'react-hook-tracer'
..
export const App = (): JSX.Element => (
  <div className="app">
    <RootComponent />
    <TraceLog />
  </div>
)
```

The trace log can also be left out, in which case traced components just show the used hooks as well as props and state, without the highlight feature.

#### Tracing a component

To trace a component, import the traced hooks (currently `useState`, `useEffect`, and `useCallback`) from `react-hook-tracer` instead of `react`, and add a `useTracer()` call at the start of the function body:

```typescript
..
import { .. /* useCallback, useEffect, useState, */ .. } from 'react'
import { useCallback, useEffect, useState, useTracer } from 'react-hook-tracer'
..
const SomeComponent = (props: SomeComponentProps) => {
  const { trace, TracePanel } = useTracer()
  const [n, setN] = useState(0)
  ..
  return (
    <div>
      /* SomeComponent rendering */
      <TracePanel />
    </div>
  )
}
```

Instead of using named imports, it is also possible to import `react-hook-tracer` as a variable, e.g. `traced`, and prefix each use-hook call with `traced.`:

```typescript
..
import { useTracer } from 'react-hook-tracer'
import * as traced from 'react-hook-tracer'
..
const SomeComponent = (props: SomeComponentProps) => {
  const { trace, TracePanel } = useTracer()
  const [n, setN] = traced.useState(0)
  ..
  return (
    <div>
      /* SomeComponent rendering */
      <TracePanel />
    </div>
  )
}
```

A traced component may use regular React hooks, which will not be visible to the tracer, and the traced hooks from `react-hook-tracer` will behave as regular hooks when used in a component without a useTrace call.

Note that `useTracer` also returns a function `trace: (message: string) => void`, which can be used to log custom trace messages.

### Trace-log message overview (WIP)

| Hook          | Phase     | Appearance in trace log                                                           |
| ------------- | --------- | --------------------------------------------------------------------------------- |
| `state`       | `init`    | On the first render, at the `useState` call.                                      |
|               | `set`     | When setting the state to a value.                                                |
|               | `update`  | When setting the state with an update function (i.e `setState(prevState => ..)`). |
| `useEffect`   | `init`    | On the first render, at the `useEffect` call.                                     |
|               | `run`     | Before the effect runs.                                                           |
|               | `cleanup` | Before the effect's cleanup function gets called.                                 |
| `useCallback` | `init`    | On the first render, at the `useCallback` call.                                   |
|               | `run`     | When the callback gets called                                                     |
|               | `refresh` | When a new callback is created due to changes in the dependencies.                |

| Event     | Appearance in trace log                                                            |
| --------- | ---------------------------------------------------------------------------------- |
| `mount`   | When the component mounts.                                                         |
| `render`  | At the start of each render.                                                       |
| `trace`   | When the custom `trace` function gets called.                                      |
| `unmount` | Just before the component unmounts (may be followed by `effect` cleanup messages). |
