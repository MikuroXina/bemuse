declare module 'keytime' {
  export interface Keyframe {
    time: number
    value: number | number[]
    ease?: string
  }
  export interface Property {
    name: string
    keyframes: Keyframe[]
  }
  export interface PropertyAccess extends Property {
    dispose(): void
    load(keyframes: Keyframe[]): void
  }
  declare function newTimeline<P extends Property[]>(
    properties: P = []
  ): Timeline<P>
  export interface Timeline<P> {
    values(timestamp: number, out: Record<P[number]['name'], number>): void
    values(timestamp: number): Record<P[number]['name'], number>
    property<K>(name: K): Property
    duration(): number
    valueOf(timestamp: number, property: Property)
    dispose(): void
    load(properties: P)
    properties(): { [K in keyof P]: P[K] & PropertyAccess }
  }
  export default newTimeline
}
