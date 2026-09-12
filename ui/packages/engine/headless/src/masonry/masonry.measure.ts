import { queryItems } from '@xihan-ui/core'
import { sameArray } from '../shared/array'
import { masonryItemQuery } from './masonry.anatomy'

/** 框架 Masonry 根的一次 DOM 测量；items 保持当前 DOM 列序，heights 已投影回作者下标。 */
export interface MasonryMeasurement {
  readonly width: number
  readonly items: readonly HTMLElement[]
  readonly heights: readonly number[]
}

/**
 * 量出容器宽度和全部 item 高度，并按 data-index 把列内 DOM 顺序投影回作者顺序。
 *
 * React/Vue 的 item wrapper 在首帧已经带稳定 data-index，因此可共享这条投影。Web Components
 * 另有“首次见到顺序”的 Light DOM 合同，不能用此函数替代其 WeakMap 顺序账本。
 */
export function measureMasonry(root: HTMLElement): MasonryMeasurement {
  const width = root.getBoundingClientRect().width
  const items = queryItems(root, masonryItemQuery)
  const heights = Array.from<number>({ length: items.length }).fill(0)
  for (const item of items) {
    const index = Number(item.dataset.index)
    if (Number.isInteger(index) && index >= 0 && index < heights.length)
      heights[index] = item.getBoundingClientRect().height
  }
  return {
    width,
    items,
    heights,
  }
}

/** 两次测量的作者序高度是否逐位相同；新数组不应导致无意义的响应式重排。 */
export function sameMasonryHeights(a: readonly number[], b: readonly number[]): boolean {
  return sameArray(a, b)
}
