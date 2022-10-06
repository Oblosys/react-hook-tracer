import { HookInfo } from './types'

export interface LogEntry {
  label: string
  origin: HookInfo
  message?: string
}

type TraceObserver = {
  setLogEntries: (entries: LogEntry[]) => void
}

export class Tracer {
  protected logEntries: LogEntry[] // TODO: Maybe make incremental
  protected listeners: TraceObserver[]

  constructor() {
    this.logEntries = []
    this.listeners = []
  }

  notifyListeners() {
    // Notify asynchronously, so we can trace during render.
    setTimeout(() => {
      for (const listener of this.listeners) {
        listener.setLogEntries(this.logEntries)
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
