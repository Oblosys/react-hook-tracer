import { HookInfo } from './types'

export interface LogEntry {
  label: string
  origin: HookInfo
  message?: string
}

type TraceObserver = { setLogEntries: (entries: LogEntry[]) => void }

export class Tracer {
  protected logEntries: LogEntry[] // TODO: Maybe make incremental
  protected listener: TraceObserver | null // TODO: allow multiple listeners

  constructor() {
    this.logEntries = []
    this.listener = null
  }

  notifyListeners() {
    // Notify asynchronously, so we can trace during render.
    setTimeout(() => {
      if (this.listener !== null) {
        this.listener.setLogEntries(this.logEntries)
      }
    }, 0)
  }

  subscribe(handler: TraceObserver): void {
    this.listener = handler
  }

  unsubscribe(): void {
    this.listener = null
  }

  clearLog(): void {
    this.logEntries = []
    this.notifyListeners()
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
