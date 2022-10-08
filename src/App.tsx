import { TraceLog } from '../packages/react-hook-tracer/src/components/TraceLog'
import { Demo } from './Demo'

import './App.css'

export const App = (): JSX.Element => (
  <div className="app">
    <Demo />
    <TraceLog />
  </div>
)
