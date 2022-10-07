import { memo, useEffect, useRef } from 'react'

import * as types from '../types'

interface LogEntriesProps {
  entries: types.LogEntry[]
  highlightedIndex: number | null
  setHighlightedIndex: (i: number) => void
}

export const LogEntries = ({ entries, highlightedIndex, setHighlightedIndex }: LogEntriesProps) => {
  const entriesWrapperRef = useRef<HTMLDivElement>(null)
  const entriesWrapperElt = entriesWrapperRef.current

  useEffect(() => {
    if (entriesWrapperElt) {
      // Scroll to bottom whenever `entries` changes.
      entriesWrapperElt.scrollTop = entriesWrapperElt.scrollHeight - entriesWrapperElt.clientHeight
    }
  }, [entriesWrapperElt, entries])

  return (
    <div className="entries-wrapper" ref={entriesWrapperRef}>
      <table className="entries">
        <tbody>
          {entries.map((entry, index) => (
            <LogEntry
              key={index}
              index={index}
              entry={entry}
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
  isHighlighted: boolean
  setHighlightedIndex: (i: number) => void
}

const LogEntry = memo(
  ({
    index,
    entry: { label, origin, message },
    isHighlighted,
    setHighlightedIndex,
  }: LogEntryProps) => (
    <tr
      className="entry"
      data-is-highlighted={isHighlighted}
      onMouseEnter={() => setHighlightedIndex(index)}
    >
      <td className="index">{index}</td>
      <td className="label">{label}</td>
      <td className="origin">{origin.hookType}</td>
      <td className="message">{message ?? ''}</td>
    </tr>
  ),
)
