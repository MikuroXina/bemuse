declare module 'throat' {
  const throat: {
    (concurrency: number): <R>(fn: () => PromiseLike<R>) => PromiseLike<R>
    <A extends unknown[], R>(
      concurrency: number,
      fn: (...args: A) => PromiseLike<R>
    ): (...args: A) => PromiseLike<R>
  }
  export = throat
}
