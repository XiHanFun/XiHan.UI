/** 至少含一个条目的连续分段。 */
export type AdjacentRun<T> = [T, ...T[]]

/**
 * 按相邻条目的非空键分段。只有连续且键相同的条目会合并；没有键的条目各自成段。
 *
 * 该投影与框架、DOM 和具体菜单无关，放在 Core 供所有适配器共享。
 */
export function groupAdjacentRuns<T, K>(
  items: readonly T[],
  keyOf: (item: T) => K | null | undefined,
): Array<AdjacentRun<T>> {
  const runs: Array<AdjacentRun<T>> = []
  for (const item of items) {
    const key = keyOf(item)
    const last = runs.at(-1)
    if (last && key != null && Object.is(keyOf(last[0]), key))
      last.push(item)
    else
      runs.push([item])
  }
  return runs
}
