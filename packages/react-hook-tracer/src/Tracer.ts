import { HookInfo } from './types'

// TODO: Move to types
export interface LogEntry {
  label: string
  origin: HookInfo
  message?: string
}

type TraceObserver = {
  setLogEntries?: (entries: LogEntry[]) => void
  setSelectedLogEntryIndex?: (index: number | null) => void
  setSelectedLogEntry?: (entry: LogEntry | null) => void
}

export class Tracer {
  protected logEntries: LogEntry[] // TODO: Maybe make incremental
  protected selectedEntryIndex: number | null
  protected listeners: TraceObserver[]

  constructor() {
    this.logEntries = []
    this.listeners = []
    this.selectedEntryIndex = null
  }

  notifyListeners() {
    // Notify asynchronously, so we can trace during render.
    setTimeout(() => {
      const selectedLogEntry =
        this.selectedEntryIndex === null ? null : this.logEntries[this.selectedEntryIndex]

      for (const listener of this.listeners) {
        listener.setLogEntries?.(this.logEntries)
        listener.setSelectedLogEntryIndex?.(this.selectedEntryIndex)
        listener.setSelectedLogEntry?.(selectedLogEntry)
      }
    }, 0)
  }

  subscribe(handler: TraceObserver): number {
    this.listeners = [...this.listeners, handler]
    return this.listeners.length - 1
  }

  unsubscribe(listenerId: number): void {
    this.listeners = this.listeners.flatMap((listener, index) =>
      index === listenerId ? [] : [listener],
    )
  }

  clearLog(): void {
    this.logEntries = []
    this.selectedEntryIndex = null
    this.notifyListeners()
  }

  selectLogEntry(index: number): void {
    console.log('selectLogEntry', index)
    this.selectedEntryIndex = index // TODO: Handle non-existent index (might happen with hot reloads).
    this.notifyListeners() // TODO: Fine grained notify, and later only update affected hook panels
  }

  trace(label: string, origin: HookInfo, message?: string): void {
    const logEntry = { label, origin, message }
    const consoleLogArgs = [
      'Trace:',
      logEntry.label,
      logEntry.origin.hookType,
      ...(logEntry.message !== undefined ? [logEntry.message] : []),
    ]
    console.log(...consoleLogArgs)

    this.logEntries = [...this.logEntries, logEntry]
    this.notifyListeners()
  }
}

export const tracer = new Tracer()
