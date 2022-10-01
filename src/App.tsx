import './App.css'
import { Demo } from './Demo'
import { TraceLog } from './react-hook-tracer/components/TraceLog'

export const App = (): JSX.Element => (
  <div className="app">
    <Demo />
    <TraceLog />
  </div>
)
