// 未结束块与进行中工具的寻址表，值为 parts 数组下标。
import type { BlockKey } from './events'

/** 未结束的块：BlockKey → parts 数组下标，块结束时移除。 */
export type BlockIndex = ReadonlyMap<BlockKey, number>

/** 进行中的工具：toolCallId → parts 数组下标。 */
export type ToolIndex = ReadonlyMap<string, number>

/** 写入一条映射，返回新 Map。 */
export function withEntry<K>(map: ReadonlyMap<K, number>, key: K, index: number): ReadonlyMap<K, number> {
  const next = new Map(map)
  next.set(key, index)
  return next
}

/** 删除一条映射，返回新 Map；键不存在时同样返回新拷贝。 */
export function withoutEntry<K>(map: ReadonlyMap<K, number>, key: K): ReadonlyMap<K, number> {
  const next = new Map(map)
  next.delete(key)
  return next
}
