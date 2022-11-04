/* eslint-disable @typescript-eslint/no-use-before-define */
import { useState, useTracer } from 'react-hook-tracer'

import './Counter.css'

export const Demo = () => <Counter title="Trace test" />

const Counter = ({ title }: { title: string }) => {
  const { TracePanel } = useTracer()
  const [n, setN] = useState(0, { label: 'n' })
  return (
    <div className="counter">
      <b>{title}</b>
      <span>
        Value of n: {n}
        <input type="button" value="Inc n" onClick={() => setN((prev) => prev + 1)} />
      </span>
      <TracePanel />
    </div>
  )
}
