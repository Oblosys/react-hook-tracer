import { Observable } from './Observable'
import * as reactDevTools from './reactDevTools'
import { LogEntry, Payload, Phase, TraceOrigin, TracerConfig } from './types'
import * as util from './util'

export class Tracer {
  protected shouldTraceToConsole: boolean // Does not need to be observable.

  protected traceLogRegistered: boolean // Does not need to be observable.

  protected logEntries: Observable<LogEntry[]>

  protected selectedEntry: Observable<{ index: number; entry: LogEntry } | null>

  protected tracedComponentLabels: Observable<string[]>

  constructor() {
    this.shouldTraceToConsole = false
    this.traceLogRegistered = false
    this.logEntries = new Observable<LogEntry[]>([])
    this.selectedEntry = new Observable<{ index: number; entry: LogEntry } | null>(null)
    this.tracedComponentLabels = new Observable<string[]>([])
  }

  registerTraceLog() {
    this.traceLogRegistered = true
  }

  isTraceLogRegistered(): boolean {
    return this.traceLogRegistered
  }

  setShouldTraceToConsole(shouldTraceToConsole: boolean) {
    if (shouldTraceToConsole !== this.shouldTraceToConsole) {
      console.log(
        `react-hook-tracer: Trace to console turned ${shouldTraceToConsole ? 'on' : 'off'}.`,
      )
    }
    this.shouldTraceToConsole = shouldTraceToConsole
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

  logPendingToConsole(): void {
    this.logEntries.value.forEach(traceToConsole)
  }

  trace<T>(
    componentLabel: string,
    origin: TraceOrigin,
    phase?: Phase,
    messageOrObject?: string | { value: T; show: (v: T) => string },
  ): void {
    if (reactDevTools.getIsRenderedByDevTools()) {
      // Silence any traces emitted during a React DevTools shallow render.
      return
    }

    const payload: Payload<T> =
      messageOrObject === undefined
        ? { type: 'empty' }
        : typeof messageOrObject === 'string'
        ? { type: 'string', message: messageOrObject }
        : { type: 'value', value: messageOrObject.value, show: messageOrObject.show }

    const logEntry: LogEntry = { componentLabel, origin, phase, payload }

    if (this.shouldTraceToConsole) {
      traceToConsole(logEntry)
    }

    // Since setLogEntries calls observer handlers that will in turn call setState functions, we call it asynchronously
    // in a timeout, to avoid calling setState during render.
    setTimeout(() => this.setLogEntries([...this.logEntries.value, logEntry]), 0)
  }
}

export const tracer = new Tracer()

export const setTracerConfig = (tracerConfig: TracerConfig): void => {
  const { traceToConsole } = tracerConfig

  if (traceToConsole !== undefined) {
    tracer.setShouldTraceToConsole(traceToConsole)
  }
}

export const clearLog = (): void => tracer.clearLog()

export const isTraceLogRegistered = (): boolean => tracer.isTraceLogRegistered()

export const logPendingToConsole = (): void => tracer.logPendingToConsole()

const traceToConsole = (logEntry: LogEntry) => {
  const { componentLabel, origin, phase: rawPhase, payload } = logEntry

  const rawOriginType = origin.originType
  const { originType, phase } = util.rewriteOriginTypeMount(rawOriginType, rawPhase)

  const colon = phase !== undefined && payload.type !== 'empty' ? ':' : ''

  // TODO: Would be nice to use show if it is user-specified, but we currently cannot determine that here.
  const message = payload.type === 'string' ? payload.message : ''

  const initialArgs: (string | unknown)[] = [
    `${componentLabel} %c${originType}%c ` +
      `%c${origin.label ? `«${origin.label}» ` : ''}%c` +
      `%c${phase ?? ''}%c${colon}` +
      `${message}`,

    'font-style:italic;',
    '',
    'font-weight:bold;',
    '',
    'font-style:italic;',
    '',
  ]

  const objectArg: unknown[] = payload.type === 'value' ? [payload.value] : []

  const logArgs = [...initialArgs, ...objectArg]
  console.log(...logArgs)
}
