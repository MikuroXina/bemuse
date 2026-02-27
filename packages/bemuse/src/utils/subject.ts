import { useCallback, useRef, useSyncExternalStore } from 'react'

export class Subject<T> extends EventTarget {
  constructor() {
    super()
  }

  #callbackMap = new Map<(value: T) => void, EventListener>()

  on(callback: (value: T) => void): void {
    if (this.#callbackMap.has(callback)) {
      return
    }
    const listener = (event: Event) => {
      callback((event as CustomEvent<T>).detail)
    }
    super.addEventListener('subject', listener)
    this.#callbackMap.set(callback, listener)
  }

  off(callback: (value: T) => void): void {
    if (this.#callbackMap.has(callback)) {
      super.removeEventListener('subject', this.#callbackMap.get(callback)!)
    }
  }

  dispatch(value: T): void {
    super.dispatchEvent(new CustomEvent<T>('subject', { detail: value }))
  }

  dispose() {
    for (const listener of this.#callbackMap.values()) {
      super.removeEventListener('subject', listener)
    }
  }

  [Symbol.dispose]() {
    this.dispose()
  }
}

export const useSubject = <T>(subject: Subject<T>, defaultValue: T): T => {
  const valueRef = useRef(defaultValue)
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const listener = (newValue: T) => {
        valueRef.current = newValue
        onStoreChange()
      }
      subject.on(listener)
      return () => {
        subject.off(listener)
      }
    },
    [subject]
  )
  return useSyncExternalStore(subscribe, () => valueRef.current)
}
