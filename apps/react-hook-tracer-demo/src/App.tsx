import { ReactEventHandler, useCallback, useEffect, useState } from 'react'
import { TraceLog, clearLog, resetComponentRegistry, setTracerConfig } from 'react-hook-tracer'

import { ItemSelector } from './ItemSelector'
import * as contextDemo from './demos/ContextDemo'
import * as counter from './demos/Counter'
import * as demo from './demos/Demo'
import * as domRef from './demos/DomRef'
import * as reducer from './demos/Reducer'

import './App.css'

const demoComponents = [
  { label: 'Demo', component: demo.Demo },
  { label: 'Context', component: contextDemo.Demo },
  { label: 'Counter', component: counter.Demo },
  { label: 'Reducer', component: reducer.Demo },
  { label: 'DOM ref', component: domRef.Demo },
]

const sessionStorageKeyBase = '@@react-hook-tracer-demo--persistent-state:'
export const sessionShouldTraceToConsoleKey = sessionStorageKeyBase + 'shouldTraceToConsole'
export const sessionSelectedDemoIndexKey = sessionStorageKeyBase + 'demoIndexKey'

const sessionShouldTraceToConsole =
  (sessionStorage.getItem(sessionShouldTraceToConsoleKey) ?? 'false') === 'true'
const sessionSelectedDemoIndex = +(sessionStorage.getItem(sessionSelectedDemoIndexKey) ?? '0')

export const App = (): JSX.Element => {
  const [shouldTraceToConsole, setShouldTraceToConsole] = useState(sessionShouldTraceToConsole)
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(sessionSelectedDemoIndex)
  const [isShowing, setIsShowing] = useState(true)

  const onChangeConsoleCheckbox: ReactEventHandler<HTMLInputElement> = useCallback((e) => {
    const shouldTraceToConsole = e.currentTarget.checked
    setShouldTraceToConsole(shouldTraceToConsole)
    sessionStorage.setItem(sessionShouldTraceToConsoleKey, '' + shouldTraceToConsole)
  }, [])

  setTracerConfig({ traceToConsole: shouldTraceToConsole })

  const onSelectDemo = useCallback((selectedIndex: number) => {
    setSelectedDemoIndex(selectedIndex)
    sessionStorage.setItem(sessionSelectedDemoIndexKey, '' + selectedIndex)
    resetComponentRegistry()
    setIsShowing(false)
  }, [])

  useEffect(() => {
    // Resetting and clearing is slightly tricky, as rendering a new demo component will queue up unmount traces from
    // the previous component together with traces from the new component. We therefore use `isShowing` to trigger the
    // unmount traces, and clear the log afterwards.

    if (!isShowing) {
      setIsShowing(true)
      // Traces are queued in a timeout (to allow tracing during render), so we also need a timeout to clear.
      setTimeout(() => clearLog(), 0)
    }
  }, [isShowing])

  const SelectedDemoComponent = demoComponents[selectedDemoIndex].component
  return (
    <div className="app">
      <div className="demo-pane">
        <div className="column">
          <div className="demo-pane-header">
            <div className="controls">
              <div className="demo-selector">
                <div className="label">Selected demo:</div>
                <ItemSelector
                  labeledItems={demoComponents}
                  selectedIndex={selectedDemoIndex}
                  onSelect={onSelectDemo}
                />
              </div>
              <div className="labeled-input">
                <input
                  id="console-checkbox"
                  type="checkbox"
                  checked={shouldTraceToConsole}
                  onChange={onChangeConsoleCheckbox}
                />
                <label htmlFor="console-checkbox">Trace to console</label>
              </div>
            </div>
            <a
              className="github-link"
              href="https://github.com/Oblosys/react-hook-tracer#readme"
              target="_blank"
              rel="noreferrer"
            >
              <GitHubLogo />
              GitHub repo
            </a>
          </div>
          {isShowing && <SelectedDemoComponent />}
        </div>
      </div>
      <TraceLog />
    </div>
  )
}

const GitHubLogo = () => (
  <div className="svg-icon github-logo">
    <svg
      fill="#000000"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="2 2 20 19.5"
      width="15px"
      height="15px"
    >
      <path d="M10.9,2.1c-4.6,0.5-8.3,4.2-8.8,8.7c-0.5,4.7,2.2,8.9,6.3,10.5C8.7,21.4,9,21.2,9,20.8v-1.6c0,0-0.4,0.1-0.9,0.1 c-1.4,0-2-1.2-2.1-1.9c-0.1-0.4-0.3-0.7-0.6-1C5.1,16.3,5,16.3,5,16.2C5,16,5.3,16,5.4,16c0.6,0,1.1,0.7,1.3,1c0.5,0.8,1.1,1,1.4,1 c0.4,0,0.7-0.1,0.9-0.2c0.1-0.7,0.4-1.4,1-1.8c-2.3-0.5-4-1.8-4-4c0-1.1,0.5-2.2,1.2-3C7.1,8.8,7,8.3,7,7.6C7,7.2,7,6.6,7.3,6 c0,0,1.4,0,2.8,1.3C10.6,7.1,11.3,7,12,7s1.4,0.1,2,0.3C15.3,6,16.8,6,16.8,6C17,6.6,17,7.2,17,7.6c0,0.8-0.1,1.2-0.2,1.4 c0.7,0.8,1.2,1.8,1.2,3c0,2.2-1.7,3.5-4,4c0.6,0.5,1,1.4,1,2.3v2.6c0,0.3,0.3,0.6,0.7,0.5c3.7-1.5,6.3-5.1,6.3-9.3 C22,6.1,16.9,1.4,10.9,2.1z" />
    </svg>
  </div>
)
