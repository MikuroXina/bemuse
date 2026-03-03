import Progress from '@bemuse/progress'

export type ResolvedDeps<DS, D> = D extends []
  ? Record<string, never>
  : D extends [infer H, ...infer R]
    ? H extends keyof DS
      ? { [_ in H]: DS[H] } & ResolvedDeps<DS, R>
      : never
    : never

export interface Task<D, DK extends (keyof D)[], K, T> {
  depKeys: DK
  run: (deps: D) => T
  outputKey: K
}

export interface TaskItem {
  text: string
  progressText: string
  progress: number
}

export interface MultiTask<DS extends Record<string, unknown>> {
  currentTasks: { [K in keyof DS]: Promise<DS[K]> }
  progresses: Record<keyof DS, Progress>
  descriptions: Record<keyof DS, string>
  task: <const N extends string, const D extends (keyof DS)[], O>(
    name: N,
    deps: D,
    run: (resolved: ResolvedDeps<DS, D>, progress: Progress) => Promise<O>,
    description?: string
  ) => MultiTask<DS & { [K in N]: O }>
  pushMessage: <const N extends string>(
    name: N,
    description: string,
    progress: Progress
  ) => MultiTask<DS & { [K in N]: never[] }>
  run: <const N extends keyof DS>(name: N) => Promise<DS[N]>
  taskItems: () => TaskItem[]
}

export const begin = (): MultiTask<Record<string, never>> =>
  beginWith({}, {}, {})

export const beginWith = <const DS extends Record<string, unknown>>(
  currentTasks: { [K in keyof DS]: Promise<DS[K]> },
  progresses: Record<keyof DS, Progress>,
  descriptions: Record<keyof DS, string>
): MultiTask<DS> => ({
  currentTasks,
  progresses,
  descriptions,
  task: <const N extends string, const D extends (keyof DS)[], O>(
    name: N,
    deps: D,
    run: (resolved: ResolvedDeps<DS, D>, progress: Progress) => Promise<O>,
    description?: string
  ): MultiTask<DS & { [K in N]: O }> => {
    const newProgress = new Progress()
    const newTask = async (): Promise<O> => {
      const resolvedDeps: Record<string, unknown> = {}
      for (const key of deps) {
        resolvedDeps[key as string] = await currentTasks[key]
      }
      return run(resolvedDeps as ResolvedDeps<DS, D>, newProgress)
    }
    return beginWith(
      { ...currentTasks, [name]: newTask() },
      description == null ? progresses : { ...progresses, [name]: newProgress },
      description == null
        ? descriptions
        : { ...descriptions, [name]: description }
    ) as MultiTask<DS & { [K in N]: O }>
  },
  pushMessage: <const N extends string>(
    name: N,
    description: string,
    progress: Progress
  ): MultiTask<DS & { [K in N]: never[] }> =>
    beginWith(
      { ...currentTasks, [name]: Promise.resolve([]) },
      { ...progresses, [name]: progress },
      { ...descriptions, [name]: description }
    ) as MultiTask<DS & { [K in N]: never[] }>,
  run: <const N extends keyof DS>(name: N): Promise<DS[N]> =>
    currentTasks[name],
  taskItems: () =>
    Object.keys(currentTasks)
      .filter((key) => key in descriptions)
      .map((key) => ({
        text: descriptions[key],
        progressText: progresses[key].toString(),
        progress: progresses[key].progress ?? 0,
      })),
})
