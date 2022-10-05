import { useCallback } from 'react'

import { useEffect, useState, useTracer } from '../packages/react-hook-tracer/src/hookTracer'
import { LabeledCheckbox } from './helper/LabeledCheckbox'
import { SimpleButton } from './helper/SimpleButton'
import { Tagged } from './helper/Tagged'

export const Demo = () => (
  <div className="demo">
    <Parent />
  </div>
)

const Parent = () => {
  const { label, trace, hooks } = useTracer()
  // const { label, trace, hooks } = { label: 'l', trace: (_: string) => {}, hooks: ['none'] }
  const [showLastChild, setShowLastChild] = useState(true)
  const [x, setX] = useState(42)

  useEffect(() => {
    trace(`running effect, x=${x}`)
    return () => {
      trace('cleaning up')
    }
  }, [x, trace])

  const onCheckboxChange = useCallback((checked: boolean) => {
    setShowLastChild(checked)
  }, [])

  const incX = useCallback(() => {
    trace('custom message')
    setX((prevX) => prevX + 1)
  }, [trace])

  return (
    <Tagged name="Parent">
      Label: {label} Hooks: {JSON.stringify(hooks)}
      <div>state = {JSON.stringify({ x })}</div>
      <div className="controls">
        <SimpleButton value="inc x" onClick={incX} />
        <LabeledCheckbox
          label="showLastChild"
          checked={showLastChild}
          onChange={onCheckboxChange}
        />
      </div>
      <Child x={x} incX={incX} />
      {showLastChild && <Child x={x} incX={incX} />}
    </Tagged>
  )
}

interface ChildProps {
  x: number
  incX: () => void
}
const Child = (props: ChildProps) => {
  const { label, hooks } = useTracer()
  const [y, setY] = useState(1)
  const incY = () => setY((prevY) => prevY + 1)
  return (
    <Tagged name="Child" showProps={{ x: props.x, y }}>
      Label: {label} Hooks: {JSON.stringify(hooks)}
      <div>state = {JSON.stringify({ y })}</div>
      <div className="controls">
        <SimpleButton value="inc x" onClick={props.incX} />
        <SimpleButton value="inc y" onClick={incY} />
        <SimpleButton
          value="inc x & y"
          onClick={() => {
            incY()
            props.incX()
          }}
        />
      </div>
    </Tagged>
  )
}
