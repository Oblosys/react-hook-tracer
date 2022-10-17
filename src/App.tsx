import { TraceLog } from 'react-hook-tracer'

import { Demo } from './Demo'

import './App.css'

export const App = (): JSX.Element => (
  <div className="app">
    <Demo />
    <TraceLog />
  </div>
)
