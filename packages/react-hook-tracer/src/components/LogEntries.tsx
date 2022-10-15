import { memo, useEffect, useRef } from 'react'

import * as types from '../types'

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
              isTraced={tracedComponentLabels.includes(entry.label)}
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
    entry: { label, origin, message, customOriginLabel },
    isTraced,
    isHighlighted,
    setHighlightedIndex,
  }: LogEntryProps) => (
    <tr
      className="entry"
      data-is-traced={isTraced}
      data-is-highlighted={isHighlighted}
      onMouseEnter={() => setHighlightedIndex(index)}
    >
      <td className="index">{('' + index).padStart(2)}</td>
      <td className="label">{label}</td>
      <td className="origin">
        {customOriginLabel === undefined ? origin.originType : customOriginLabel}
      </td>
      <td className="message">{message ?? ''}</td>
    </tr>
  ),
)
