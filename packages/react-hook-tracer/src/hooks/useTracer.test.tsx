import { render, screen } from '@testing-library/react'

import { getPanelProps, getPanelTraceOrigins } from '../test/util'
import { useCallback } from './useCallback'
import { useEffect } from './useEffect'
import { useState } from './useState'
import { useTracer } from './useTracer'

test('renders TracePanel', () => {
  const Test = () => {
    const { TracePanel } = useTracer()
    useState()
    useEffect(() => {}, [])
    useCallback(() => {}, [])
    return <TracePanel />
  }

  render(<Test />)
  const componentLabel = screen.getByTestId('trace-panel').querySelector('.component-label')
  expect(componentLabel).toHaveTextContent('Test-1')

  // TODO: Log
  expect(getPanelTraceOrigins()).toEqual([
    'mount',
    'render',
    'state:undefined',
    'effect',
    'callback',
    'trace',
    'unmount',
  ])
})

test('shows props in TracePanel', () => {
  const Parent = () => <Test n={42} f={() => {}} />
  const Test = (_props: { n: number; f: () => void }) => {
    const { TracePanel } = useTracer()
    return <TracePanel />
  }

  render(<Parent />)
  expect(getPanelProps()).toEqual(['n=42', 'f=<function>'])
})

test('supports custom showProps', () => {
  const Parent = () => <Test n={42} f={() => {}} />
  const Test = (_props: { n: number; f: () => void }) => {
    const { TracePanel } = useTracer({ showProps: { n: (n) => `[${n}]`, f: () => '[Function]' } })
    return <TracePanel />
  }

  render(<Parent />)
  expect(getPanelProps()).toEqual(['n=[42]', 'f=[Function]'])
})

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

test('throws when useTracer is not the first hook call', () => {
  jest.spyOn(console, 'error').mockImplementation() // Don't fail this test on console.error logging.

  const Test = () => {
    useState()
    useTracer()
    return <></>
  }

  expect(() => {
    render(<Test />)
  }).toThrow('`useTracer` needs to be called at the start of the component')
})
