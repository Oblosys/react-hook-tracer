import { Observable } from './Observable'
import * as reactDevTools from './reactDevTools'
import { LogEntry, Phase, TraceOrigin } from './types'

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

  protected setTracedComponentLabels(componentLabels: string[]) {
    this.tracedComponentLabels.setValue(componentLabels)
  }

  registerTracedComponentLabel(componentLabel: string): void {
    this.setTracedComponentLabels([...this.tracedComponentLabels.value, componentLabel])
  }

  unregisterTracedComponentLabel(componentLabel: string): void {
    this.setTracedComponentLabels(
      this.tracedComponentLabels.value.filter((l) => l !== componentLabel),
    )
  }

  clearLog(): void {
    this.setLogEntries([])
    this.setSelectedEntryIndex(null)
  }

  selectLogEntry(index: number | null): void {
    this.setSelectedEntryIndex(index) // TODO: Handle non-existent index (might happen with hot reloads).
  }

  updateLogEntryIndex(update: (prevIndex: number | null) => number | null): void {
    this.setSelectedEntryIndex(update(this.selectedEntry.value?.index ?? null))
  }

  trace(componentLabel: string, origin: TraceOrigin, message?: string): void
  trace(componentLabel: string, origin: TraceOrigin, message: string, phase: Phase): void
  trace(entry: LogEntry): void
  trace(...args: TraceArgs): void {
    if (reactDevTools.getIsRenderedByDevTools()) {
      // Silence any traces emitted during a React DevTools shallow render.
      return
    }

    const { componentLabel, origin, message, phase } =
      args.length === 1
        ? args[0]
        : { componentLabel: args[0], origin: args[1], phase: args[3], message: args[2] }

    const logEntry: LogEntry = { componentLabel, origin, phase, message }

    // Since setLogEntries calls observer handlers that will in turn call setState functions, we call it asynchronously
    // in a timeout, to avoid calling setState during render.
    setTimeout(() => this.setLogEntries([...this.logEntries.value, logEntry]), 0)
  }
}

type TraceArgs =
  | readonly [componentLabel: string, origin: TraceOrigin, message?: string]
  | readonly [componentLabel: string, origin: TraceOrigin, message: string, phase?: Phase]
  | readonly [entry: LogEntry]

export const tracer = new Tracer()
