// 开放块的寻址表。值一律是 parts 数组下标，不存第二份块数据——
// 两份数据一定会漂移，真源只留 parts 本身。
import type { BlockKey } from './events'

/** 开着的块：BlockKey → parts 数组下标。块结束时从表里删，parts 里已定型的 part 保留。 */
export type BlockIndex = ReadonlyMap<BlockKey, number>

/** 进行中的工具：toolCallId → parts 数组下标。 */
export type ToolIndex = ReadonlyMap<string, number>

/** 返回新 Map。reducer 是纯函数，任何情况下都不得原地改入参。 */
export function withEntry<K>(map: ReadonlyMap<K, number>, key: K, index: number): ReadonlyMap<K, number> {
  const next = new Map(map)
  next.set(key, index)
  return next
}

/** 同上，键不存在时也照样返回一份新拷贝，调用方无需先判存在。 */
export function withoutEntry<K>(map: ReadonlyMap<K, number>, key: K): ReadonlyMap<K, number> {
  const next = new Map(map)
  next.delete(key)
  return next
}
