import * as util from './util'

interface Observer<T> {
  id: number
  changeHandler: (value: T) => void
}

export class Observable<T> {
  value: T
  nextObserverId: number
  observers: Observer<T>[]

  constructor(value: T) {
    this.value = value
    this.nextObserverId = 0
    this.observers = []
  }

  subscribe(changeHandler: (value: T) => void): number {
    const observerId = this.nextObserverId
    this.nextObserverId = this.nextObserverId + 1

    this.observers = [...this.observers, { id: observerId, changeHandler }]
    const value = this.value // Indexing in the timeout callback would be fine, but this is more accurate.
    changeHandler(value)
    return observerId
  }

  unsubscribe(id: number): void {
    this.observers = util.flatMap(this.observers, (observer) =>
      observer.id === id ? [] : ([observer] as const),
    )
  }

  setValue(value: T) {
    // Using getter & setter will not add much, and probably make the code less clear.
    this.value = value
    this.notifyObservers()
  }

  notifyObservers() {
    const handlers = this.observers.map((o) => o.changeHandler)

    const value = this.value
    handlers.forEach((handler) => handler(value))
  }
}
