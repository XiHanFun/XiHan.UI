// 性质测试的最小底座：种子随机数 + 批量生成用例，失败时把出错的用例带进消息里，便于复现。

/** mulberry32：32 位状态的种子随机数，返回 [0, 1)。同一个种子永远得到同一串数。 */
export function seeded(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6D2B79F5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** [min, max) 内的均匀随机数。 */
export function between(random: () => number, min: number, max: number): number {
  return min + (max - min) * random()
}

/** [min, max] 内的随机整数。 */
export function integer(random: () => number, min: number, max: number): number {
  return Math.floor(between(random, min, max + 1))
}

/** 跨越多个数量级的随机数：先取指数再取尾数，覆盖 1e-6 到 1e9 这类极端跨度。 */
export function magnitude(random: () => number, minPower = -6, maxPower = 9): number {
  const sign = random() < 0.5 ? -1 : 1
  return sign * between(random, 1, 10) * 10 ** integer(random, minPower, maxPower)
}

/** 生成 runs 个用例逐个检查；某个用例失败时报出它的序号与内容。 */
export function forAll<T>(runs: number, seed: number, make: (random: () => number) => T, check: (value: T) => void): void {
  const random = seeded(seed)
  for (let run = 0; run < runs; run++) {
    const value = make(random)
    try {
      check(value)
    }
    catch (error) {
      const detail = JSON.stringify(value, (_, v) => (v instanceof Date ? v.toISOString() : v))
      throw new Error(`第 ${run} 个用例失败（种子 ${seed}）：${detail}\n${(error as Error).message}`)
    }
  }
}
