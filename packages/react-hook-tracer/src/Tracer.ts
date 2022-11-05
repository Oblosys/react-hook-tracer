import { Observable } from './Observable'
import * as reactDevTools from './reactDevTools'
import { LogEntry, Phase, TraceOrigin, TracerConfig } from './types'
import * as util from './util'

export class Tracer {
  protected shouldTraceToConsole: boolean // Does not need to be observable.

  protected logEntries: Observable<LogEntry[]>

  protected selectedEntry: Observable<{ index: number; entry: LogEntry } | null>

  protected tracedComponentLabels: Observable<string[]>

  constructor() {
    this.shouldTraceToConsole = false
    this.logEntries = new Observable<LogEntry[]>([])
    this.selectedEntry = new Observable<{ index: number; entry: LogEntry } | null>(null)
    this.tracedComponentLabels = new Observable<string[]>([])
  }

  setShouldTraceToConsole(shouldTraceToConsole: boolean) {
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

    if (this.shouldTraceToConsole) {
      traceToConsole(componentLabel, origin, phase, messageOrObject)
    }

    const message =
      messageOrObject === undefined
        ? undefined
        : typeof messageOrObject === 'string'
        ? messageOrObject
        : messageOrObject.show(messageOrObject.value)

    const logEntry: LogEntry = { componentLabel, origin, phase, message }

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

const traceToConsole = <T>(
  componentLabel: string,
  origin: TraceOrigin,
  rawPhase?: Phase,
  messageOrObject?: string | { value: T; show: (v: T) => string },
) => {
  const rawOriginType = origin.originType
  const { originType, phase } = util.rewriteOriginTypeMount(rawOriginType, rawPhase)

  const colon = phase !== undefined && messageOrObject !== undefined ? ':' : ''

  // TODO: Would be nice to use show if it is user-specified, but we currently cannot determine that here.
  const message = typeof messageOrObject === 'string' ? messageOrObject : ''

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

  const objectArg: unknown[] =
    messageOrObject !== undefined && typeof messageOrObject !== 'string'
      ? [messageOrObject.value]
      : []

  const logArgs = [...initialArgs, ...objectArg]
  console.log(...logArgs)
}
