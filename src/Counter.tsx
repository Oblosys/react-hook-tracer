import { useState, useTracer } from './react-hook-tracer/hookTracer'
import * as internals from './react-hook-tracer/internals'

interface CounterProps {
  p: string
}

let fiberNode: internals.Fiber | null = null

export const Counter = (props: CounterProps): JSX.Element => {
  const { label } = useTracer()
  if (fiberNode === null) {
    fiberNode = internals.getCurrentOwner()
  }

  const [count, setCount] = useState(0)
  return (
    <div>
      <p>label: {label}</p>
      <input type="button" value="inc upd" onClick={() => setCount((n) => n + 1)} />
      <input type="button" value="inc imm" onClick={() => setCount(count + 1)} />
      <p>Count: {count}</p>
      <p>props.p: {props.p}</p>
    </div>
  )
}
