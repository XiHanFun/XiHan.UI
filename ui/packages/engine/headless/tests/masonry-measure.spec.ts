// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import { measureMasonry, sameMasonryHeights } from '../src/masonry/index'

function rect(width: number, height: number): DOMRect {
  return { bottom: height, height, left: 0, right: width, top: 0, width, x: 0, y: 0, toJSON: () => ({}) }
}

describe('masonry DOM 测量投影', () => {
  it('返回容器宽度与当前 DOM item，并按 data-index 把高度投影回作者顺序', () => {
    const root = document.createElement('div')
    root.dataset.scope = 'masonry'
    root.dataset.part = 'root'
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue(rect(768, 0))

    const items = [2, 0, 1].map((index) => {
      const item = document.createElement('div')
      item.dataset.scope = 'masonry'
      item.dataset.part = 'item'
      item.dataset.index = String(index)
      vi.spyOn(item, 'getBoundingClientRect').mockReturnValue(rect(0, (index + 1) * 10))
      root.append(item)
      return item
    })

    const measurement = measureMasonry(root)
    expect(measurement.width).toBe(768)
    expect(measurement.items).toEqual(items)
    expect(measurement.heights).toEqual([10, 20, 30])
  })

  it('缺失、越界或非整数 data-index 不会写错其他项的高度', () => {
    const root = document.createElement('div')
    root.dataset.scope = 'masonry'
    root.dataset.part = 'root'
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue(rect(320, 0))
    for (const index of [undefined, '-1', '1.5']) {
      const item = document.createElement('div')
      item.dataset.scope = 'masonry'
      item.dataset.part = 'item'
      if (index !== undefined)
        item.dataset.index = index
      vi.spyOn(item, 'getBoundingClientRect').mockReturnValue(rect(0, 99))
      root.append(item)
    }

    expect(measureMasonry(root).heights).toEqual([0, 0, 0])
  })

  it('高度序列按长度和逐位数值判等，不因新数组引用误报变化', () => {
    expect(sameMasonryHeights([10, 20], [10, 20])).toBe(true)
    expect(sameMasonryHeights([10, 20], [20, 10])).toBe(false)
    expect(sameMasonryHeights([10], [10, 0])).toBe(false)
    expect(sameMasonryHeights([Number.NaN], [Number.NaN])).toBe(false)
  })
})
