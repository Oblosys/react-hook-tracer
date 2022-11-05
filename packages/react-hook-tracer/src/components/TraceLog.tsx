import { useCallback, useEffect, useReducer } from 'react'

import { tracer } from '../Tracer'
import { AssertNever, LogEntry } from '../types'
import * as util from '../util'
import {
  Delay,
  DelaySelector,
  getSessionReplayTimerDelay,
  setSessionReplayTimerDelay,
} from './DelaySelector'
import { LogEntries } from './LogEntries'
import { SvgButton } from './SvgButton'

import './TraceLog.css'

interface State {
  replayTimerDelay: Delay
  tracedComponentLabels: string[]
  logEntries: LogEntry[]
  isReplaying: boolean
  highlightedIndex: number | null
}
const initialState: State = {
  replayTimerDelay: getSessionReplayTimerDelay(),
  tracedComponentLabels: [],
  logEntries: [],
  isReplaying: false,
  highlightedIndex: null,
}
type Action =
  | { type: 'setReplayTimerDelay'; delay: Delay }
  | { type: 'setTracedComponentLabels'; labels: string[] }
  | { type: 'setLogEntries'; entries: LogEntry[] }
  | { type: 'setHighlightedIndex'; index: number | null }
  | { type: 'setIsReplaying'; isReplaying: boolean }
  | { type: 'step'; direction: -1 | 1 }

const reducer = (prevState: State, action: Action): State => {
  switch (action.type) {
    case 'setReplayTimerDelay': {
      return { ...prevState, replayTimerDelay: action.delay }
    }
    case 'setTracedComponentLabels': {
      return { ...prevState, tracedComponentLabels: action.labels }
    }
    case 'setLogEntries': {
      const { entries } = action
      // Start replay if more entries were added, and unless already replaying, highlight the first new entry.
      if (entries.length > prevState.logEntries.length) {
        const highlightedIndex = prevState.isReplaying
          ? prevState.highlightedIndex
          : prevState.logEntries.length
        return { ...prevState, logEntries: entries, isReplaying: true, highlightedIndex }
      }
      return { ...prevState, logEntries: entries }
    }
    case 'setHighlightedIndex': {
      const { index } = action
      if (index !== null && index < 0 && index >= prevState.logEntries.length - 1) {
        return prevState
      }
      return { ...prevState, highlightedIndex: index }
    }
    case 'setIsReplaying': {
      // Don't start replay when last entry is highlighted.
      const isReplaying =
        action.isReplaying &&
        !(
          prevState.highlightedIndex === null ||
          prevState.highlightedIndex === prevState.logEntries.length - 1
        )
      return { ...prevState, isReplaying }
    }
    case 'step': {
      const { direction } = action
      if (prevState.highlightedIndex === null) {
        return prevState
      }
      const highlightedIndex = util.clip(
        0,
        prevState.logEntries.length - 1,
        prevState.highlightedIndex + direction,
      )

      // Stop replay if the new highlight is the last entry.
      const isReplaying =
        highlightedIndex === prevState.logEntries.length - 1 ? false : prevState.isReplaying
      return { ...prevState, isReplaying, highlightedIndex }
    }
    default: {
      type _Assertion = AssertNever<typeof action>
      throw new Error(`Unhandled action type.`)
    }
  }
}

export const TraceLog = (): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Update local state.tracedComponentLabels when global tracer value changes.
  useEffect(() => {
    const observerId = tracer.subscribeTracedComponentLabels((labels) =>
      dispatch({ type: 'setTracedComponentLabels', labels }),
    )
    return () => tracer.unsubscribeTracedComponentLabels(observerId)
  }, [])

  // Update local state.logEntries when tracer global value changes.
  useEffect(() => {
    const observerId = tracer.subscribeLogEntries((entries) =>
      dispatch({ type: 'setLogEntries', entries }),
    )
    return () => tracer.unsubscribeLogEntries(observerId)
  }, [])

  // Update global tracer logEntry when local state.highlightedIndex changes.
  useEffect(() => {
    tracer.selectLogEntry(state.highlightedIndex)
  }, [state.highlightedIndex])

  // Start/stop timer on state.isReplaying changes, and restart on state.replayTimerDelay changes.
  useEffect(() => {
    if (state.isReplaying) {
      const replayTimerId = setInterval(() => {
        dispatch({ type: 'step', direction: 1 })
      }, state.replayTimerDelay * 1000)

      return () => clearInterval(replayTimerId)
    }
  }, [state.replayTimerDelay, state.isReplaying])

  const setReplayTimerDelay = (delay: Delay) => {
    setSessionReplayTimerDelay(delay)
    dispatch({ type: 'setReplayTimerDelay', delay })
  }
  const startReplay = useCallback(() => {
    dispatch({ type: 'step', direction: 1 })
    dispatch({ type: 'setIsReplaying', isReplaying: true })
  }, [])
  const stopReplay = useCallback(() => dispatch({ type: 'setIsReplaying', isReplaying: false }), [])
  const stepReplay = useCallback(
    (direction: -1 | 1) => {
      stopReplay()
      dispatch({ type: 'step', direction })
    },
    [stopReplay],
  )
  const setHighlightedIndex = useCallback(
    (index: number) => {
      stopReplay()
      dispatch({ type: 'setHighlightedIndex', index })
    },
    [stopReplay],
  )
  const clearLog = () => {
    stopReplay()
    dispatch({ type: 'setHighlightedIndex', index: null })
    tracer.clearLog()
  }

  return (
    <div className="trace-log">
      <div className="header">
        <div className="title">Trace log</div>
        <div className="spacer"></div>
        <div className="buttons">
          <SvgButton
            type="previous"
            tooltip="previous entry"
            isDisabled={state.highlightedIndex === null || state.highlightedIndex === 0}
            onClick={() => stepReplay(-1)}
          />{' '}
          {state.isReplaying ? (
            <SvgButton type="pause" tooltip="pause replay" onClick={stopReplay} />
          ) : (
            <SvgButton
              type="play"
              tooltip="start replay"
              onClick={startReplay}
              isDisabled={
                state.logEntries.length === 0 ||
                state.highlightedIndex === state.logEntries.length - 1
              }
            />
          )}{' '}
          <SvgButton
            type="next"
            tooltip="next entry"
            isDisabled={
              state.highlightedIndex === null ||
              state.highlightedIndex === state.logEntries.length - 1
            }
            onClick={() => stepReplay(1)}
          />
        </div>
        <div className="spacer"></div>
        <SvgButton
          type="trash"
          tooltip="clear log"
          onClick={clearLog}
          isDisabled={state.logEntries.length === 0}
        />
        <div className="delay-selector">
          Delay:
          <DelaySelector value={state.replayTimerDelay} onChange={setReplayTimerDelay} />
        </div>
      </div>
      <LogEntries
        logEntries={state.logEntries}
        tracedComponentLabels={state.tracedComponentLabels}
        highlightedIndex={state.highlightedIndex}
        setHighlightedIndex={setHighlightedIndex}
      />
    </div>
  )
}
