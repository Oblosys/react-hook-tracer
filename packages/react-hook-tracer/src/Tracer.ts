import { HookInfo, LogEntry } from './types'

type LogEntriesObserver = {
  onChangeLogEntries: (entries: LogEntry[]) => void
}
type SelectedEntryObserver = {
  onChangeSelectedLogEntry: (index: number | null, entry: LogEntry | null) => void
}

export class Tracer {
  protected logEntries: LogEntry[] // TODO: Maybe make incremental
  protected logEntriesObservers: LogEntriesObserver[]

  protected setLogEntries(logEntries: LogEntry[]) {
    this.logEntries = logEntries

    setTimeout(() => {
      this.logEntriesObservers.forEach(({ onChangeLogEntries }) =>
        onChangeLogEntries(this.logEntries),
      )
    }, 0)
  }

  protected selectedEntryIndex: number | null
  protected selectedEntryObservers: SelectedEntryObserver[]

  protected setSelectedEntryIndex(index: number | null) {
    this.selectedEntryIndex = index

    setTimeout(() => {
      const selectedLogEntry =
        this.selectedEntryIndex === null ? null : this.logEntries[this.selectedEntryIndex]

      this.selectedEntryObservers.forEach(({ onChangeSelectedLogEntry }) =>
        onChangeSelectedLogEntry(this.selectedEntryIndex, selectedLogEntry),
      )
    }, 0)
  }

  constructor() {
    this.logEntries = []
    this.logEntriesObservers = []
    this.selectedEntryIndex = null
    this.selectedEntryObservers = []
  }

  subscribeLogEntries(handler: LogEntriesObserver): number {
    this.logEntriesObservers = [...this.logEntriesObservers, handler]
    return this.logEntriesObservers.length - 1
  }

  unsubscribeLogEntries(observerId: number): void {
    this.logEntriesObservers = this.logEntriesObservers.flatMap((observer, index) =>
      index === observerId ? [] : [observer],
    )
  }

  subscribeSelectedEntry(handler: SelectedEntryObserver): number {
    this.selectedEntryObservers = [...this.selectedEntryObservers, handler]
    return this.selectedEntryObservers.length - 1
  }

  unsubscribeSelectedEntry(observerId: number): void {
    this.selectedEntryObservers = this.selectedEntryObservers.flatMap((observer, index) =>
      index === observerId ? [] : [observer],
    )
  }

  clearLog(): void {
    this.setLogEntries([])
    this.setSelectedEntryIndex(null)
  }

  selectLogEntry(index: number): void {
    console.log('selectLogEntry', index)
    this.setSelectedEntryIndex(index) // TODO: Handle non-existent index (might happen with hot reloads).
  }

  trace(label: string, origin: HookInfo, message?: string): void {
    const logEntry = { label, origin, message }
    const consoleLogArgs = [
      'Trace:',
      logEntry.label,
      logEntry.origin.hookType,
      ...(logEntry.message !== undefined ? [logEntry.message] : []),
    ]
    // Log entry to console:
    console.log(...consoleLogArgs)

    this.setLogEntries([...this.logEntries, logEntry])
  }
}

export const tracer = new Tracer()
