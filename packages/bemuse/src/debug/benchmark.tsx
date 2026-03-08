/* eslint-disable @typescript-eslint/no-explicit-any */
import now from '@bemuse/utils/now.js'
import { createRoot } from 'react-dom/client'

import BenchmarkPanel from '../devtools/components/BenchmarkPanel.js'
import { shouldEnableBenchmark } from '../devtools/query-flags.js'

export class Stat {
  sum = 0
  count = 0
  average = 0
  readonly hist: { delta: number; time: number }[] = []
  lastSec = 0
  secAvg = 0

  push(delta: number) {
    const t = now()
    this.sum += delta
    this.count += 1
    this.average = this.sum / this.count
    this.lastSec += delta
    this.hist.push({ delta, time: t })
    while (this.hist[0] && this.hist[0].time < t - 1000) {
      this.lastSec -= this.hist.shift()!.delta
    }
    this.secAvg = this.lastSec / this.hist.length
  }
  toString() {
    return format(this.average) + ' / ' + format(this.secAvg)
  }
}

function format(x: number): string {
  return x.toFixed(2) + 'ms'
}

export interface Benchmarker {
  enabled: boolean
  stats: Record<string, Stat>
  wrap<F extends (...args: any[]) => unknown>(title: string, f: F): F
  benchmark<
    K extends PropertyKey,
    O extends Record<K, (...args: any[]) => unknown>,
  >(
    title: string,
    obj: O,
    name: K
  ): void
  toString(): string
}

function Benchmarker(): Benchmarker {
  const stats: Record<string, Stat> = {}
  const bench = {
    enabled: true,
    stats,
    wrap<F extends (...args: any[]) => unknown>(title: string, f: F): F {
      return function (...args) {
        const start = now()
        try {
          return f(...args)
        } finally {
          const finish = now()
          const stat = stats[title] || (stats[title] = new Stat())
          stat.push(finish - start)
        }
      } as F
    },
    benchmark<
      K extends PropertyKey,
      O extends Record<K, (...args: any[]) => unknown>,
    >(title: string, obj: O, name: K): void {
      obj[name] = this.wrap(title, obj[name])
    },
    toString(): string {
      const lines: string[] = []
      Object.keys(stats).forEach(function (key) {
        lines.push('- ' + key + ': ' + stats[key])
      })
      return lines.join('\n')
    },
  } satisfies Benchmarker
  const div = document.createElement('div')
  div.setAttribute('style', 'position:fixed;top:10px;right:10px;z-index:99999')
  document.body.appendChild(div)
  createRoot(div).render(<BenchmarkPanel bench={bench} />)
  return bench
}

function FakeBenchmarker(): Benchmarker {
  return {
    enabled: false,
    stats: {},
    wrap: <F extends (...args: any[]) => unknown>(_title: string, f: F): F => f,
    benchmark: () => {},
  }
}

export default (window as unknown as Record<string, unknown>).BEMUSE_BENCHMARK =
  shouldEnableBenchmark() ? Benchmarker() : FakeBenchmarker()
