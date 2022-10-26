import { TraceLog } from 'react-hook-tracer'

import { Demo } from './demos/Demo'

import './App.css'

export const App = (): JSX.Element => (
  <div className="app">
    <div className="demo-pane">
      <Demo />
    </div>
    <TraceLog />
  </div>
)
