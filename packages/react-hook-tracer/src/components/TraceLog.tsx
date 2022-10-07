import { useCallback, useEffect, useState } from 'react'

import { tracer } from '../Tracer'
import { LogEntry } from '../types'
import { LogEntries } from './LogEntries'
import { SimpleButton } from './SimpleButton'

import './TraceLog.css'

export const TraceLog = (): JSX.Element => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])

  const [selectedLogEntryIndex, setSelectedLogEntryIndex] = useState<number | null>(null)

  const setHighlightedIndex = useCallback((index: number) => tracer.selectLogEntry(index), [])

  const clearLog = () => tracer.clearLog()

  const [tracedComponentLabels, setTracedComponentLabels] = useState<string[]>([])

  useEffect(() => {
    const observerId = tracer.subscribeLogEntries({
      onChangeLogEntries: setLogEntries,
    })
    return () => tracer.unsubscribeLogEntries(observerId)
  }, [])

  useEffect(() => {
    const observerId = tracer.subscribeSelectedEntry({
      onChangeSelectedLogEntry: (index, _entry) => setSelectedLogEntryIndex(index),
    })
    return () => tracer.unsubscribeSelectedEntry(observerId)
  }, [])

  useEffect(() => {
    const observerId = tracer.subscribeTracedComponentLabels({
      onChangeTracedComponentLabels: setTracedComponentLabels,
    })
    return () => tracer.unsubscribeTracedComponentLabels(observerId)
  }, [])

  return (
    <div className="trace-log">
      <div className="header">
        <div className="controls">
          <div className="title">Log</div>
          <div className="buttons">
            <SimpleButton value="clear log" onClick={clearLog} />{' '}
            {/* <span className="emoji-button" onClick={() => this.props.stepLog(-1)}>
              {'\u23EA'}
            </span>
            {this.props.replayTimerId === null ? (
              <span className="emoji-button" onClick={() => this.props.startReplay()}>
                {'\u25B6\uFE0F'}
              </span>
            ) : (
              <span className="emoji-button" onClick={() => this.props.pauseReplay()}>
                {'\u23F8'}
              </span>
            )}
            <span className="emoji-button" onClick={() => this.props.stepLog(1)}>
              {'\u23E9'}
            </span> */}
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
        setHighlightedIndex={setHighlightedIndex}
      />
    </div>
  )
}
