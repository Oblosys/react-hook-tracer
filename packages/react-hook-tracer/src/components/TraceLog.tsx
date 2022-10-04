import { useEffect, useState } from 'react'

import { LogEntry, tracer } from '../tracer'
import { LogEntries } from './LogEntries'
import { SimpleButton } from './SimpleButton'

import './TraceLog.css'

export const TraceLog = (): JSX.Element => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])

  // const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(0)

  const clearLog = () => tracer.clearLog()

  // const addLogEntry = (entry: LogEntry) => setLogEntries((prevEntries) => [...prevEntries, entry])

  useEffect(() => {
    console.log('subscribing')
    tracer.subscribe(setLogEntries)
    return () => tracer.unsubscribe()
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
        highlightedIndex={highlightedIndex}
        setHighlightedIndex={setHighlightedIndex}
      />
    </div>
  )
}
