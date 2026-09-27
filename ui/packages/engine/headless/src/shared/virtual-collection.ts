/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 集合组件与 Virtualizer 的共享数据导航协议：语义按完整集合计算，DOM 只负责承载当前窗口。

import type { NavIntent } from '@xihan-ui/core'
import type { CollectionVirtualizer } from '../virtualizer'
import { stepIndex } from '@xihan-ui/core'

export interface VirtualCollectionOptions<T> {
  value: (item: T) => string
  disabled?: (item: T) => boolean
  loop?: boolean
}

export interface VirtualCollectionTarget<T> {
  index: number
  item: T
  value: string
}

/** 接线必须同时给完整 collection，并让 Virtualizer.count 与当前语义序列严格一致。 */
export function assertCollectionVirtualizer(
  component: string,
  virtualizer: CollectionVirtualizer | undefined,
  count: number,
  hasCollection: boolean,
): void {
  if (!virtualizer)
    return
  if (!hasCollection)
    throw new Error(`[xh] ${component} 接入 CollectionVirtualizer 时必须提供 collection`)
  if (virtualizer.count !== count)
    throw new RangeError(`[xh] ${component} 的 CollectionVirtualizer.count 必须等于 ${count}，实际为 ${virtualizer.count}`)
}

/** 按完整数据序求方向键目标；禁用项跳过，Home / End 与回绕语义与 DOM 导航一致。 */
export function virtualCollectionTarget<T>(
  items: readonly T[],
  from: string | null,
  intent: NavIntent,
  options: VirtualCollectionOptions<T>,
): VirtualCollectionTarget<T> | null {
  const fromIndex = from == null ? -1 : items.findIndex(item => options.value(item) === from)
  const index = stepIndex(items.length, fromIndex, intent, {
    loop: options.loop,
    skip: options.disabled ? i => options.disabled!(items[i]!) : undefined,
  })
  if (index < 0)
    return null
  const item = items[index]!
  return { index, item, value: options.value(item) }
}

/** 与 Core typeahead 同规则：普通前缀允许命中当前项，同一字符连打从下一项轮换。 */
export function virtualCollectionMatch<T>(
  items: readonly T[],
  from: string | null,
  query: string,
  options: VirtualCollectionOptions<T> & { text: (item: T) => string },
): VirtualCollectionTarget<T> | null {
  if (!items.length || !query)
    return null
  const fromIndex = from == null ? -1 : items.findIndex(item => options.value(item) === from)
  const cycling = query.length > 1 && [...query].every(char => char === query[0])
  const needle = (cycling ? query[0]! : query).toLowerCase()
  const start = cycling || fromIndex < 0 ? fromIndex + 1 : fromIndex
  for (let offset = 0; offset < items.length; offset++) {
    const index = (start + offset + items.length) % items.length
    const item = items[index]!
    if (options.disabled?.(item))
      continue
    if (options.text(item).trim().toLowerCase().startsWith(needle))
      return { index, item, value: options.value(item) }
  }
  return null
}

/** 虚拟列表里 DOM 条数不等于语义总数，集合条目必须显式报告其全局位置。 */
export function virtualCollectionAria(
  index: number | undefined,
  count: number,
): { 'aria-posinset'?: number, 'aria-setsize'?: number } {
  return index == null || index < 0
    ? {}
    : { 'aria-posinset': index + 1, 'aria-setsize': count }
}
