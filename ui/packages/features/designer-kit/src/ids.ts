/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 文档内唯一 id：按「前缀 + 序号」接着已有的最大序号往下编，以及粘贴时的新旧 id 对照。

/** 取 id 在 prefix 之后的正整数序号；不是 `${prefix}${正整数}` 的形式时为 0。 */
function sequenceOf(id: string, prefix: string): number {
  if (!id.startsWith(prefix))
    return 0
  const rest = id.slice(prefix.length)
  return /^[1-9]\d*$/.test(rest) ? Number(rest) : 0
}

/** 生成不在 taken 中的 id，形如 `${prefix}${n}`，n 取 taken 里同前缀正整数序号的最大值加一。 */
export function nextFreeId(prefix: string, taken: Iterable<string>): string {
  let max = 0
  for (const id of taken)
    max = Math.max(max, sequenceOf(id, prefix))
  return `${prefix}${max + 1}`
}

/** 连续分配 id：同一个分配器给出的 id 互不重复，也不与登记过的 id 重复。 */
export interface IdAllocator {
  /** 分配下一个 id。 */
  readonly next: () => string
  /** 登记一个已被占用的 id，此后不会再分配它，序号也从它之后接着编。 */
  readonly reserve: (id: string) => void
}

/** 创建 id 分配器：从 taken 里同前缀的最大序号之后接着编，跳过登记过的 id。 */
export function createIdAllocator(prefix: string, taken: Iterable<string> = []): IdAllocator {
  const used = new Set<string>()
  let counter = 0
  const reserve = (id: string): void => {
    used.add(id)
    counter = Math.max(counter, sequenceOf(id, prefix))
  }
  for (const id of taken)
    reserve(id)
  return {
    next() {
      let id: string
      do
        id = `${prefix}${++counter}`
      while (used.has(id))
      used.add(id)
      return id
    },
    reserve,
  }
}

/** 为一组旧 id 各分配一个新 id，返回旧 → 新的对照表；重复的旧 id 只分配一次，allocate 给出重复的新 id 时抛错。 */
export function remapIds(ids: Iterable<string>, allocate: (id: string) => string): Map<string, string> {
  const map = new Map<string, string>()
  const assigned = new Set<string>()
  for (const id of ids) {
    if (map.has(id))
      continue
    const next = allocate(id)
    if (assigned.has(next))
      throw new Error(`[designer-kit] remapIds: allocate returned "${next}" more than once`)
    assigned.add(next)
    map.set(id, next)
  }
  return map
}
