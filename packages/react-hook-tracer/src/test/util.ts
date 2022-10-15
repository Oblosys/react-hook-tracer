import { prettyDOM, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export const setupUser = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

export const getPanelProps = (): string[] =>
  [...screen.queryAllByTestId('prop')].flatMap(({ textContent }) =>
    textContent ? [textContent] : [],
  )

export const getPanelTraceOrigins = (): string[] =>
  [...screen.queryAllByTestId('trace-origin')].flatMap(({ textContent }) =>
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

// Console-log hook-panel trace-origins for debugging.
export const debugShowPanelTraceOrigins = (debugLabel?: string) => {
  // eslint-disable-next-line no-console
  console.log(`Panel trace origins${showDebugLabel(debugLabel)}:`, getPanelTraceOrigins())
}

// Console-log hook-panel trace-origins DOM for debugging.
export const debugShowPanelTraceOriginsDom = (debugLabel?: string) => {
  // eslint-disable-next-line no-console
  console.log(
    `Panel trace origins${showDebugLabel(debugLabel)}:`,
    prettyDOM(screen.getByTestId('hook-panel')),
  )
}
