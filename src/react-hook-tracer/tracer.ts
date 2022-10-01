// TODO: Use class + maybe use different name
export interface LogEntry {
  label: string
  stage: string
  message: string
}

type TraceObserver = (entry: LogEntry[]) => void

const logEntries: { entries: LogEntry[] } = { entries: [] }

const listeners: { listener: TraceObserver | null } = { listener: null }

const notifyListeners = () => {
  setTimeout(() => {
    if (listeners.listener !== null) {
      listeners.listener(logEntries.entries)
    }
  }, 0)
}

export const tracer = {
  subscribe: (handler: TraceObserver): void => {
    listeners.listener = handler
  },
  unsubscribe: (): void => {
    listeners.listener = null
  },
  clearLog: (): void => {
    logEntries.entries = []
    notifyListeners()
  },
  trace: (entry: LogEntry): void => {
    logEntries.entries = [...logEntries.entries, entry]
    notifyListeners()
  },
}

export const trace = (label: string, stage: string, message = ''): void => {
  const logEntry = {
    label,
    stage,
    message,
  }
  tracer.trace(logEntry)
  if (message === '') {
    console.log('Trace:', logEntry.label, logEntry.stage, logEntry.message)
  } else {
    console.log('Trace:', logEntry.label, logEntry.stage)
  }
}
