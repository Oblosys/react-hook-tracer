import { prettyDOM, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as util from '../util'

export const setupUser = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

export const getPanelProps = (): string[] =>
  util.flatMap(screen.queryAllByTestId('prop'), ({ textContent }) =>
    textContent ? [textContent] : [],
  )

export const getPanelTraceOrigins = (): string[] =>
  util.flatMap(screen.queryAllByTestId('trace-origin'), ({ textContent }) =>
    textContent ? [textContent] : [],
  )

const getLogEntryChildren = (
  element: HTMLElement,
): Record<'label' | 'origin' | 'message', string> => {
  const getChildText = (index: number) => element.children[index].textContent ?? 'missing-child'
  return { label: getChildText(0), origin: getChildText(1), message: getChildText(2) }
}

export const getLogEntries = (): Record<'label' | 'origin' | 'message', string>[] =>
  [...screen.queryAllByTestId('log-entry')].map(getLogEntryChildren)

const showDebugLabel = (debugLabel?: string) => (debugLabel ? ` (${debugLabel})` : '')

// Console-log trace-panel trace-origins for debugging.
export const debugShowPanelTraceOrigins = (debugLabel?: string) => {
  // eslint-disable-next-line no-console
  console.log(`Panel trace origins${showDebugLabel(debugLabel)}:`, getPanelTraceOrigins())
}

// Console-log trace-panel trace-origins DOM for debugging.
export const debugShowPanelTraceOriginsDom = (debugLabel?: string) => {
  // eslint-disable-next-line no-console
  console.log(
    `Panel trace origins${showDebugLabel(debugLabel)}:`,
    prettyDOM(screen.getByTestId('trace-panel')),
  )
}
