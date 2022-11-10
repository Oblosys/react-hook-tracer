import { act, render, screen } from '@testing-library/react'

import { TraceLog } from '../components/TraceLog'
import { getLogEntries, getPanelTraceOrigins, setupUser } from '../test/util'
import { useRef } from './useRef'
import { useTracer } from './useTracer'

test('handles ref-value update', async () => {
  const user = setupUser()
  const Test = () => {
    const { TracePanel } = useTracer()
    const ref = useRef(42)
    return (
      <div>
        <span data-testid="ref">{ref.current}</span>
        <input type="button" value="inc" onClick={() => (ref.current += 1)} />
        <TracePanel />
        <TraceLog />
      </div>
    )
  }
  expect(getLogEntries()).toHaveLength(0)
  render(<Test />)
  act(() => jest.runOnlyPendingTimers())

  expect(getLogEntries()).toContainEqual({
    componentLabel: 'Test-1',
    origin: 'ref',
    message: 'init:42',
  })
  expect(screen.getByTestId('ref').textContent).toBe('42')
  expect(getPanelTraceOrigins()).toContain('ref:42')

  await user.click(screen.getByText('inc'))
  act(() => jest.runOnlyPendingTimers())

  expect(getLogEntries()).toContainEqual({
    componentLabel: 'Test-1',
    origin: 'ref',
    message: 'update:43',
  })
  expect(getPanelTraceOrigins()).toContain('ref:43')
})

test('allows missing ref value', () => {
  const Test = () => {
    const { TracePanel } = useTracer()
    useRef()
    return <TracePanel />
  }

  render(<Test />)
  expect(getPanelTraceOrigins()).toContain('ref:undefined')
})

test('supports custom label', () => {
  const Test = () => {
    const { TracePanel } = useTracer()
    useRef(42, { label: 'answer' })
    return <TracePanel />
  }

  render(<Test />)
  expect(getPanelTraceOrigins()).toContain('ref«answer»:42')
})

test('supports custom show', () => {
  const Test = () => {
    const { TracePanel } = useTracer()
    useRef({ p: 42 }, { show: (v) => `[${v.p}]` })
    return <TracePanel />
  }

  render(<Test />)
  expect(getPanelTraceOrigins()).toContain('ref:[42]')
})

test('can handle DOM element', () => {
  const Test = () => {
    useTracer()
    const ref = useRef(null)
    return (
      <div ref={ref}>
        <TraceLog />
      </div>
    )
  }

  render(<Test />)
  act(() => jest.runOnlyPendingTimers())

  expect(getLogEntries()).toContainEqual({
    componentLabel: 'Test-1',
    origin: 'ref',
    message: 'init:null',
  })
  expect(getLogEntries()).toContainEqual({
    componentLabel: 'Test-1',
    origin: 'ref',
    message: 'update:[object HTMLDivElement]',
  })
})

test('can handle cyclic object', () => {
  const cyclicObject: { cycle?: unknown } = {}
  cyclicObject.cycle = cyclicObject

  const Test = () => {
    useTracer()

    const ref = useRef<{ cycle?: unknown }>()
    ref.current = cyclicObject
    return (
      <div>
        <TraceLog />
      </div>
    )
  }

  render(<Test />)
  act(() => jest.runOnlyPendingTimers())

  expect(getLogEntries()).toContainEqual({
    componentLabel: 'Test-1',
    origin: 'ref',
    message: 'init:undefined',
  })
  expect(getLogEntries()).toContainEqual({
    componentLabel: 'Test-1',
    origin: 'ref',
    message: 'update:[object Object]',
  })
})

test('allows ref mutation during render', () => {
  const Test = () => {
    const { TracePanel } = useTracer()
    const ref = useRef(1)
    ref.current += 1

    return <TracePanel />
  }

  const { rerender } = render(<Test />)
  rerender(<Test />)
  expect(getPanelTraceOrigins()).toContain('ref:3')
})
