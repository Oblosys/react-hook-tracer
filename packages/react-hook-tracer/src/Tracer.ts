import { Observable } from './Observable'
import { LogEntry, TraceOrigin } from './types'

export class Tracer {
  protected logEntries: Observable<LogEntry[]>

  protected selectedEntry: Observable<{ index: number; entry: LogEntry } | null>

  protected tracedComponentLabels: Observable<string[]>

  constructor() {
    this.logEntries = new Observable<LogEntry[]>([])
    this.selectedEntry = new Observable<{ index: number; entry: LogEntry } | null>(null)
    this.tracedComponentLabels = new Observable<string[]>([])
  }

  subscribeLogEntries(changeHandler: (value: LogEntry[]) => void): number {
    return this.logEntries.subscribe(changeHandler)
  }

  unsubscribeLogEntries(observerId: number): void {
    this.logEntries.unsubscribe(observerId)
  }

  protected setLogEntries(logEntries: LogEntry[]) {
    this.logEntries.setValue(logEntries)
  }

  subscribeSelectedEntry(
    changeHandler: (value: { index: number; entry: LogEntry } | null) => void,
  ): number {
    return this.selectedEntry.subscribe(changeHandler)
  }

  unsubscribeSelectedEntry(observerId: number): void {
    this.selectedEntry.unsubscribe(observerId)
  }

  protected setSelectedEntryIndex(index: number | null) {
    this.selectedEntry.setValue(
      index === null ? null : { index, entry: this.logEntries.value[index] },
    )
  }

  subscribeTracedComponentLabels(changeHandler: (value: string[]) => void): number {
    return this.tracedComponentLabels.subscribe(changeHandler)
  }

  unsubscribeTracedComponentLabels(observerId: number): void {
    this.tracedComponentLabels.unsubscribe(observerId)
  }

  protected setTracedComponentLabels(labels: string[]) {
    this.tracedComponentLabels.setValue(labels)
  }

  registerTracedComponentLabel(label: string): void {
    this.setTracedComponentLabels([...this.tracedComponentLabels.value, label])
  }

  unregisterTracedComponentLabel(label: string): void {
    this.setTracedComponentLabels(this.tracedComponentLabels.value.filter((l) => l !== label))
  }

  clearLog(): void {
    this.setLogEntries([])
    this.setSelectedEntryIndex(null)
  }

  selectLogEntry(index: number): void {
    this.setSelectedEntryIndex(index) // TODO: Handle non-existent index (might happen with hot reloads).
  }

  trace(label: string, origin: TraceOrigin, message?: string): void
  trace(label: string, origin: TraceOrigin, message: string, customOriginLabel: string): void
  trace(entry: LogEntry): void
  trace(...args: TraceArgs): void {
    const { label, origin, message, customOriginLabel } =
      args.length === 1
        ? args[0]
        : { label: args[0], origin: args[1], message: args[2], customOriginLabel: args[3] }

    const logEntry: LogEntry = { label, origin, message, customOriginLabel }
    const consoleLogArgs = [
      'Trace:',
      logEntry.label,
      customOriginLabel === undefined ? logEntry.origin.originType : customOriginLabel,
      ...(logEntry.message !== undefined ? [logEntry.message] : []),
    ]
    // Log entry to console:
    console.log(...consoleLogArgs)

    // Since setLogEntries calls observer handlers that will in turn call setState functions, we call it asynchronously
    // in a timeout, to avoid calling setState during render.
    setTimeout(() => this.setLogEntries([...this.logEntries.value, logEntry]), 0)
  }
}

type TraceArgs =
  | readonly [label: string, origin: TraceOrigin, message?: string]
  | readonly [label: string, origin: TraceOrigin, message: string, customOriginLabel?: string]
  | readonly [entry: LogEntry]

export const tracer = new Tracer()
