import './App.css'
import { TraceLog } from '../packages/react-hook-tracer/src/components/TraceLog'
import { Demo } from './Demo'

export const App = (): JSX.Element => (
  <div className="app">
    <Demo />
    <TraceLog />
  </div>
)
