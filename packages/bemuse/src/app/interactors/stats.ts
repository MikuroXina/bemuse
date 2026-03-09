import getNonMissedDeltas from './get-non-missed-deltas.js'

export const getDeltasStats = (
  deltas: readonly number[]
): { mean: number; standardDeviation: number; median: number } => {
  const xs = getNonMissedDeltas(deltas).toSorted()

  const mean = xs.reduce((prev, x) => prev + x, 0) / xs.length
  const squaredMean = xs.reduce((prev, x) => prev + x ** 2, 0) / xs.length
  const variance = squaredMean - mean ** 2
  const standardDeviation = Math.sqrt(variance)

  const median =
    xs.length === 0
      ? 0
      : xs.length % 2 === 0
        ? (xs[Math.floor(xs.length / 2) - 1] + xs[Math.floor(xs.length / 2)]) /
          2
        : xs[Math.floor(xs.length / 2)]

  return { mean, standardDeviation, median }
}
