import { ChangeEvent, useCallback } from 'react'

import * as util from '../util'

import './DelaySelector.css'

const sessionStorageKeyBase = '@@react-hook-tracer--persistent-state:'
export const sessionReplayTimerDelayKey = sessionStorageKeyBase + 'replayTimerDelay'

const allDelayValues = [0.25, 0.5, 1, 2, 5, 10] as const
export type Delay = (typeof allDelayValues)[number]

const isDelay = (n: number): n is Delay => util.isIncluded(allDelayValues, n)

const defaultDelay: Delay = 0.5

// Keep replay-timer delay in session storage, so it survives a page reload.
export const getSessionReplayTimerDelay = (): Delay => {
  const storedDelay = sessionStorage.getItem(sessionReplayTimerDelayKey)
  if (storedDelay === null) {
    return defaultDelay
  }
  const delayValue = +storedDelay
  return isDelay(delayValue) ? delayValue : defaultDelay
}
export const setSessionReplayTimerDelay = (delay: Delay): void => {
  sessionStorage.setItem(sessionReplayTimerDelayKey, '' + delay)
}

interface DelaySelectorProps {
  value: Delay
  onChange: (value: Delay) => void
}
export const DelaySelector = ({ value, onChange }: DelaySelectorProps) => {
  const changeHandler = useCallback(
    (evt: ChangeEvent<HTMLSelectElement>) => {
      const delay = +evt.currentTarget.value
      onChange(isDelay(delay) ? delay : defaultDelay)
    },
    [onChange],
  )

  return (
    <select value={value} onChange={changeHandler}>
      {allDelayValues.map((delay) => (
        <option value={'' + delay} key={delay}>
          {delay}s
        </option>
      ))}
    </select>
  )
}
