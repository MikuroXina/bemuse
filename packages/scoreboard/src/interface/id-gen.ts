import type { Brand } from 'valibot'

export interface IDGenerator {
  nextId<K extends string>(): string & Brand<K>
}
