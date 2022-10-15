import '@testing-library/react'
import { render, screen } from '@testing-library/react'

import { getPanelProps, getPanelTraceOrigins } from '../test/util'
import { useCallback } from './useCallback'
import { useEffect } from './useEffect'
import { useState } from './useState'
import { useTracer } from './useTracer'

test('renders HookPanel', () => {
  const Test = () => {
    const { HookPanel } = useTracer()
    useState()
    useEffect(() => {}, [])
    useCallback(() => {}, [])
    return <HookPanel />
  }

  render(<Test />)
  const label = screen.getByTestId('hook-panel').querySelector('.component-label')
  expect(label).toHaveTextContent('Test-1')

  // TODO: Log
  expect(getPanelTraceOrigins()).toEqual([
    'mount',
    'render',
    'state: undefined',
    'effect',
    'callback',
    'trace',
    'unmount',
  ])
})

test('shows props in HookPanel', () => {
  const Parent = () => <Test n={42} f={() => {}} />
  const Test = (_props: { n: number; f: () => void }) => {
    const { HookPanel } = useTracer()
    return <HookPanel />
  }

  render(<Parent />)
  expect(getPanelProps()).toEqual(['n=42', 'f=<function>'])
})

// TODO: test custom showProps

test('does not error when useTracer is omitted', () => {
  const Test = () => {
    useState()
    useEffect(() => {}, [])
    useCallback(() => {}, [])
    return <div>Rendering</div>
  }

  render(<Test />)
  expect(screen.getByText('Rendering')).toBeInTheDocument()
  // TODO: check console
})
