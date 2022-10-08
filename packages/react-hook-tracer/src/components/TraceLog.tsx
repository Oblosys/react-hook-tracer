import { useCallback, useEffect, useRef, useState } from 'react'

import { tracer } from '../Tracer'
import { LogEntry } from '../types'
import { LogEntries } from './LogEntries'
import { SimpleButton } from './SimpleButton'

import './TraceLog.css'

export const TraceLog = (): JSX.Element => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])

  const [selectedLogEntryIndex, setSelectedLogEntryIndex] = useState<number | null>(null)

  const setHighlightedIndex = useCallback(
    (index: number | null) => tracer.selectLogEntry(index),
    [],
  )

  const updateHighlightedIndex = useCallback(
    (update: (prevIndex: number | null) => number | null) => tracer.updateLogEntryIndex(update),
    [],
  )

  const clearLog = () => tracer.clearLog()

  const [tracedComponentLabels, setTracedComponentLabels] = useState<string[]>([])

  useEffect(() => {
    const observerId = tracer.subscribeLogEntries(setLogEntries)
    return () => tracer.unsubscribeLogEntries(observerId)
  }, [])

  useEffect(() => {
    const observerId = tracer.subscribeSelectedEntry((value) =>
      setSelectedLogEntryIndex(value?.index ?? null),
    )
    return () => tracer.unsubscribeSelectedEntry(observerId)
  }, [])

  useEffect(() => {
    const observerId = tracer.subscribeTracedComponentLabels(setTracedComponentLabels)
    return () => tracer.unsubscribeTracedComponentLabels(observerId)
  }, [])

  return (
    <TraceLogUnconnected
      logEntries={logEntries}
      clearLog={clearLog}
      tracedComponentLabels={tracedComponentLabels}
      selectedLogEntryIndex={selectedLogEntryIndex}
      setHighlightedIndex={setHighlightedIndex}
      updateHighlightedIndex={updateHighlightedIndex}
    />
  )
}

interface TraceLogUnconnectedProps {
  logEntries: LogEntry[]
  clearLog: () => void
  tracedComponentLabels: string[]
  selectedLogEntryIndex: number | null
  setHighlightedIndex: (index: number | null) => void
  updateHighlightedIndex: (update: (prevIndex: number | null) => number | null) => void
}
export const TraceLogUnconnected = ({
  logEntries,
  clearLog,
  tracedComponentLabels,
  selectedLogEntryIndex,
  setHighlightedIndex,
  updateHighlightedIndex,
}: TraceLogUnconnectedProps): JSX.Element => {
  const stepDelay = 500
  const stepTimer = useRef<number | undefined>(undefined)
  const [isReplaying, setIsReplaying] = useState(false)

  const stopReplay = useCallback(() => {
    console.log('stopTimer called')
    if (stepTimer.current !== undefined) {
      window.clearTimeout(stepTimer.current)
      stepTimer.current = undefined
      setIsReplaying(false)
      console.log('stopped timer')
    }
  }, [])

  const step = useCallback(
    (delta: -1 | 1) => {
      stopReplay()
      updateHighlightedIndex((prevIndex) =>
        prevIndex === null ? null : Math.max(0, Math.min(prevIndex + delta, logEntries.length - 1)),
      )
    },
    [updateHighlightedIndex, logEntries, stopReplay],
  )

  const startReplay = useCallback(() => {
    console.log('startReplay called')
    if (stepTimer.current === undefined && selectedLogEntryIndex !== logEntries.length - 1) {
      console.log('starting replay')
      stepTimer.current = window.setInterval(() => {
        console.log('step')
        // Will be stopped when at the last entry.
        updateHighlightedIndex((prevIndex) => (prevIndex === null ? 0 : prevIndex + 1))
      }, stepDelay)
      setIsReplaying(true)
    }
  }, [updateHighlightedIndex, selectedLogEntryIndex, logEntries.length])

  if ((selectedLogEntryIndex ?? 0) >= logEntries.length - 1) {
    console.log(`Index ${selectedLogEntryIndex} >= ${logEntries.length}`)
    stopReplay()
  }

  const previousEntryCount = useRef(0)
  useEffect(() => {
    if (logEntries.length > previousEntryCount.current) {
      console.log(`Log entries grown: ${previousEntryCount.current} ~> ${logEntries.length}`)
      if (stepTimer.current === undefined) {
        setHighlightedIndex(previousEntryCount.current)
        startReplay()
      }
    }
    previousEntryCount.current = logEntries.length
  }, [logEntries, setHighlightedIndex, startReplay])

  const pauseReplayAndSetHighlightedIndex = useCallback(
    (index: number | null) => {
      stopReplay()
      setHighlightedIndex(index)
    },
    [setHighlightedIndex, stopReplay],
  )

  return (
    <div className="trace-log">
      <div className="header">
        <div className="controls">
          <div className="title">Log</div>
          <div className="buttons">
            <SimpleButton value="clear log" onClick={clearLog} />{' '}
            <SimpleButton value="prev" onClick={() => step(-1)} />{' '}
            {isReplaying ? (
              <SimpleButton value="pause" onClick={stopReplay} />
            ) : (
              <SimpleButton value="play" onClick={startReplay} />
            )}{' '}
            <SimpleButton value="next" onClick={() => step(1)} />{' '}
          </div>
          <div>
            Delay:{' '}
            {/* <DelaySelector
                value={this.props.replayTimerDelay}
                onChange={(evt) => this.props.setDelay(+evt.currentTarget.value)}
              /> */}
          </div>
        </div>
        <div className="hint">(hover to highlight, shift-up/down to navigate)</div>
      </div>
      <LogEntries
        entries={logEntries}
        tracedComponentLabels={tracedComponentLabels}
        highlightedIndex={selectedLogEntryIndex}
        setHighlightedIndex={pauseReplayAndSetHighlightedIndex}
      />
    </div>
  )
}
