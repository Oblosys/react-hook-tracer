import { memo, useEffect, useRef } from 'react'

import * as types from '../types'
import * as util from '../util'

import './LogEntries.css'

interface LogEntriesProps {
  logEntries: types.LogEntry[]
  tracedComponentLabels: string[]
  highlightedIndex: number | null
  setHighlightedIndex: (index: number) => void
}

export const LogEntries = ({
  logEntries,
  tracedComponentLabels,
  highlightedIndex,
  setHighlightedIndex,
}: LogEntriesProps) => {
  const entriesWrapperRef = useRef<HTMLDivElement>(null)
  const entriesWrapperElt = entriesWrapperRef.current

  useEffect(() => {
    if (entriesWrapperElt) {
      // Scroll to bottom whenever `logEntries` changes.
      entriesWrapperElt.scrollTop = entriesWrapperElt.scrollHeight - entriesWrapperElt.clientHeight
    }
  }, [entriesWrapperElt, logEntries])

  return (
    <div className="entries-wrapper" ref={entriesWrapperRef}>
      <table className="entries">
        <tbody>
          {logEntries.map((entry, index) => (
            <LogEntry
              key={index}
              index={index}
              entry={entry}
              isTraced={util.includes(tracedComponentLabels, entry.componentLabel)}
              isHighlighted={index === highlightedIndex}
              setHighlightedIndex={setHighlightedIndex}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface LogEntryProps {
  index: number
  entry: types.LogEntry
  isTraced: boolean
  isHighlighted: boolean
  setHighlightedIndex: (i: number) => void
}

const LogEntry = memo(
  ({
    index,
    entry: { componentLabel, origin, payload, phase: rawPhase },
    isTraced,
    isHighlighted,
    setHighlightedIndex,
  }: LogEntryProps) => {
    const message = util.showPayload(payload)

    const rawOriginType = origin.originType
    const { originType, phase } = util.rewriteOriginTypeMount(rawOriginType, rawPhase)

    return (
      <tr
        className="entry"
        data-is-traced={isTraced}
        data-is-highlighted={isHighlighted}
        onMouseEnter={() => setHighlightedIndex(index)}
        data-testid="log-entry"
      >
        <td className="component-label">{componentLabel}</td>
        <td className="origin-type">{originType}</td>
        <td className="phase-and-message">
          {origin.label && <span className="origin-label">{`«${origin.label}»`}</span>}
          {phase && (
            <span className="trace-phase">{phase + ((message ?? '') !== '' ? ':' : '')}</span>
          )}
          {message && <span className="trace-message">{message}</span>}
        </td>
      </tr>
    )
  },
)

LogEntry.displayName = 'LogEntry'
