// TODO: Use different name
export interface LogEntry {
  label: string
  stage: string
  message: string // TODO: Make optional
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

  trace(label: string, stage: string, message = ''): void {
    const logEntry = { label, stage, message }

    this.logEntries = [...this.logEntries, logEntry]
    this.notifyListeners()
  }
}

export const tracer = new Tracer()
