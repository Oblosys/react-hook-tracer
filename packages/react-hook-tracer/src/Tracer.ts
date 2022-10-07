import { HookInfo, LogEntry } from './types'

type LogEntriesObserver = {
  onChangeLogEntries: (entries: LogEntry[]) => void
}
type SelectedEntryObserver = {
  onChangeSelectedLogEntry: (index: number | null, entry: LogEntry | null) => void
}
type TracedComponentLabelsObserver = {
  onChangeTracedComponentLabels: (labels: string[]) => void
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

  protected tracedComponentLabels: string[]
  protected tracedComponentLabelsObservers: TracedComponentLabelsObserver[]

  protected setTracedComponentLabels(labels: string[]) {
    this.tracedComponentLabels = labels

    setTimeout(() => {
      this.tracedComponentLabelsObservers.forEach(({ onChangeTracedComponentLabels }) =>
        onChangeTracedComponentLabels(this.tracedComponentLabels),
      )
    }, 0)
  }

  constructor() {
    this.logEntries = []
    this.logEntriesObservers = []
    this.selectedEntryIndex = null
    this.selectedEntryObservers = []
    this.tracedComponentLabels = []
    this.tracedComponentLabelsObservers = []
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

  subscribeTracedComponentLabels(handler: TracedComponentLabelsObserver): number {
    this.tracedComponentLabelsObservers = [...this.tracedComponentLabelsObservers, handler]
    return this.tracedComponentLabelsObservers.length - 1
  }

  unsubscribeTracedComponentLabels(observerId: number): void {
    this.tracedComponentLabelsObservers = this.tracedComponentLabelsObservers.flatMap(
      (observer, index) => (index === observerId ? [] : [observer]),
    )
  }

  addTracedComponentLabel(label: string): void {
    this.setTracedComponentLabels([...this.tracedComponentLabels, label])
    console.log('added label', label, this.tracedComponentLabels)
  }

  removeTracedComponentLabel(label: string): void {
    this.setTracedComponentLabels(this.tracedComponentLabels.filter((l) => l !== label))
    console.log('removed label', label, this.tracedComponentLabels)
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
