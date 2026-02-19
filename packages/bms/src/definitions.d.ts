declare module 'data-structure' {
  export interface Facade<T> {
    (value: T, ...bogus: unknown[]): T
  }
  export type Spec =
    | typeof Number
    | typeof String
    | 'number'
    | 'string'
    | Facade<number>
    | Facade<string>
    | { [key: string]: Spec }
  const DataStructure: {
    <T>(spec: Spec): Facade<T>
    maybe<T>(spec: Spec): Facade<T>
  }
  export = DataStructure
}

declare module 'bemuse-chardet' {
  const BemuseChardet: {
    detect(buffer: Buffer): string
  }
  export = BemuseChardet
}
