/* eslint-disable @typescript-eslint/no-use-before-define */
import { useState, useTracer } from 'react-hook-tracer'

import './Sample.css'

export const Demo = () => <Sample title="Trace test" />

export const Sample = ({ title }: { title: string }) => {
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
