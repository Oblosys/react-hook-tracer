import { forwardRef } from 'react'
import { useRef, useTracer } from 'react-hook-tracer'

import './DomRef.css'

export const Demo = () => <Parent />

const Parent = () => {
  const { TracePanel } = useTracer()
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="parent">
      <TracePanel />
      <input type="button" value="Focus on child text field" onClick={() => ref.current?.focus()} />
      <Child ref={ref} />
    </div>
  )
}

const Child = forwardRef<HTMLInputElement>((_, ref) => {
  const { TracePanel } = useTracer()
  return (
    <div className="child">
      <input type="text" ref={ref} />
      <TracePanel />
    </div>
  )
})

Child.displayName = 'Child'
