import { Subject } from '@bemuse/utils/subject.js'
import type { Container } from 'pixi.js'

export type SkinNodeComponent = (element: Element) => SkinNode

export type SkinNode = (ctx: Context) => Promise<Container | null>

export interface Context {
  defs: Record<string, SkinNode>
  refs: Map<string, Set<Container>>
  stateSubject: Subject<Record<string, unknown>>
}

export type EnvUpdater = (env: Record<string, unknown>) => void
