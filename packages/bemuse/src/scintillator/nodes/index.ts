import { Subject } from '@bemuse/utils/subject.js'
import type { Container } from 'pixi.js'

export type SkinNodeComponent = (element: Element) => SkinNode

export type SkinNode = (ctx: Context) => Promise<Container | null>

export interface Context {
  defs: Record<string, SkinNode>
  refs: Map<string, Set<Container>>
  stateSubject: SelectorSubject
}

export type EnvUpdater = (env: Record<string, unknown>) => void

export type Selector<T> = (env: Record<string, unknown>) => T

export class SelectorSubject {
  #subject = new Subject<Record<string, unknown>>()
  #selectorHandlerMap = new Map<Selector<unknown>, EnvUpdater>()
  #selectorCache = new Map<Selector<unknown>, unknown>()

  on<T>(selector: Selector<T>, handler: (newValue: T) => void): void {
    const updater: EnvUpdater = (env) => {
      const got = selector(env)
      if (easyDeepEqual(this.#selectorCache.get(selector), got)) {
        return
      }
      this.#selectorCache.set(selector, got)
      handler(got)
    }
    this.#subject.on(updater)
    this.#selectorHandlerMap.set(selector, updater)
  }

  off<T>(selector: Selector<T>): void {
    if (this.#selectorHandlerMap.has(selector)) {
      this.#subject.off(this.#selectorHandlerMap.get(selector)!)
      this.#selectorHandlerMap.delete(selector)
    }
  }

  dispatch(env: Record<string, unknown>): void {
    this.#subject.dispatch(env)
  }
}

function easyDeepEqual(left: unknown, right: unknown): boolean {
  if (
    Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === right.length
  ) {
    return left.every((l, i) => easyDeepEqual(l, right[i]))
  }
  if (
    typeof left === 'object' &&
    typeof right === 'object' &&
    left !== null &&
    right !== null
  ) {
    const rightEntries = Object.entries(right)
    return Object.entries(left).every((l, i) =>
      easyDeepEqual(l, rightEntries[i])
    )
  }
  return left === right
}
