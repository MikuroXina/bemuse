import query from '@bemuse/utils/query'

export function shouldEnableBenchmark() {
  return query.BEMUSE_BENCHMARK === '1'
}
