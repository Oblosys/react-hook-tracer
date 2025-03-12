/* eslint-disable @typescript-eslint/no-unsafe-call */
import { act, render, screen } from '@testing-library/react'

import { TraceLog } from '../components/TraceLog'
import { getLogEntries, getPanelTraceOrigins, setupUser } from '../test/util'

import { useState } from './useState'
import { useTracer } from './useTracer'

test('handles setState', async () => {
  const user = setupUser()
  const Test = () => {
    const { TracePanel } = useTracer()
    const [n, setN] = useState(42)
    return (
      <div>
        <span data-testid="state">{n}</span>
        <input type="button" value="inc" onClick={() => setN((n) => n + 1)} />
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
    origin: 'state',
    message: 'init:42',
  })
  expect(screen.getByTestId('state').textContent).toBe('42')
  expect(getPanelTraceOrigins()).toContain('state:42')

  await user.click(screen.getByText('inc'))
  act(() => jest.runOnlyPendingTimers())

  expect(getLogEntries()).toContainEqual({
    componentLabel: 'Test-1',
    origin: 'state',
    message: 'update:43',
  })
  expect(screen.getByTestId('state').textContent).toBe('43')
  expect(getPanelTraceOrigins()).toContain('state:43')
})

test('allows initial state thunk', () => {
  const Test = () => {
    const { TracePanel } = useTracer()
    useState(() => 42)
    return <TracePanel />
  }

  render(<Test />)
  expect(getPanelTraceOrigins()).toContain('state:42')
})

test('allows absent initial state', () => {
  const Test = () => {
    const { TracePanel } = useTracer()
    useState()
    return <TracePanel />
  }

  render(<Test />)
  expect(getPanelTraceOrigins()).toContain('state:undefined')
})

test('supports custom label', () => {
  const Test = () => {
    const { TracePanel } = useTracer()
    useState(42, { label: 'answer' })
    return <TracePanel />
  }

  render(<Test />)
  expect(getPanelTraceOrigins()).toContain('state«answer»:42')
})

test('supports custom show', () => {
  const Test = () => {
    const { TracePanel } = useTracer()
    useState({ p: 42 }, { show: (s) => `[${s.p}]` })
    return <TracePanel />
  }

  render(<Test />)
  expect(getPanelTraceOrigins()).toContain('state:[42]')
})
