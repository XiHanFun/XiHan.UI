import type { DndRect } from '../src'
import { describe, expect, it } from 'vitest'
import { insertionOffsets, insertionSlot, projectInsertion } from '../src'

/** 竖直列表：n 项，高 h，间距 gap，从 top 起排。 */
function column(n: number, h = 100, gap = 0, top = 0): DndRect[] {
  return Array.from({ length: n }, (_, i) => ({ x: 0, y: top + i * (h + gap), width: 200, height: h }))
}

/** 从右往左排的水平列表：DOM 第 0 项在最右。 */
function rowRtl(n: number, w = 100, gap = 0): DndRect[] {
  return Array.from({ length: n }, (_, i) => ({ x: (n - 1 - i) * (w + gap), y: 0, width: w, height: 40 }))
}

const BOX: DndRect = { x: 10, y: 20, width: 300, height: 400 }
const SIZE = { width: 200, height: 60 }

describe('跨列表插入 · 落点', () => {
  it('按中心数：拖入项中心之前有几项就插在第几位', () => {
    const rects = column(3) // 中心 50 / 150 / 250
    expect(projectInsertion({ rects, point: { x: 0, y: 10 }, axis: 'vertical' })).toBe(0)
    expect(projectInsertion({ rects, point: { x: 0, y: 51 }, axis: 'vertical' })).toBe(1)
    expect(projectInsertion({ rects, point: { x: 0, y: 249 }, axis: 'vertical' })).toBe(2)
    expect(projectInsertion({ rects, point: { x: 0, y: 900 }, axis: 'vertical' })).toBe(3)
  })

  it('恰好压在某项中心上还算在它之前：越过才算越过', () => {
    expect(projectInsertion({ rects: column(3), point: { x: 0, y: 150 }, axis: 'vertical' })).toBe(1)
  })

  it('空列表恒落在第 0 位', () => {
    expect(projectInsertion({ rects: [], point: { x: 0, y: 500 }, axis: 'vertical' })).toBe(0)
  })

  it('水平反向排布：往左越过的项才算在前面，方向由首尾两项判出', () => {
    const rects = rowRtl(3) // DOM 第 0 项在 x 200..300，中心 250 / 150 / 50
    expect(projectInsertion({ rects, point: { x: 280, y: 0 }, axis: 'horizontal' })).toBe(0)
    expect(projectInsertion({ rects, point: { x: 180, y: 0 }, axis: 'horizontal' })).toBe(1)
    expect(projectInsertion({ rects, point: { x: 10, y: 0 }, axis: 'horizontal' })).toBe(3)
  })

  it('只有一项判不出方向时按传入的方向算', () => {
    const rects = [{ x: 100, y: 0, width: 100, height: 40 }] // 中心 150
    expect(projectInsertion({ rects, point: { x: 120, y: 0 }, axis: 'horizontal' })).toBe(0)
    expect(projectInsertion({ rects, point: { x: 120, y: 0 }, axis: 'horizontal', direction: -1 })).toBe(1)
  })
})

describe('跨列表插入 · 让位', () => {
  it('插入点及其后的项挪出一格：拖入项的尺寸加一个间距', () => {
    const offsets = insertionOffsets({ rects: column(3, 100, 8), index: 1, axis: 'vertical', size: SIZE, gap: 8, box: BOX })
    expect(offsets).toEqual([{ x: 0, y: 0 }, { x: 0, y: 68 }, { x: 0, y: 68 }])
  })

  it('排到末尾时一项都不让', () => {
    const offsets = insertionOffsets({ rects: column(3), index: 3, axis: 'vertical', size: SIZE, gap: 0, box: BOX })
    expect(offsets.every(o => o.x === 0 && o.y === 0)).toBe(true)
  })

  it('水平反向排布往左让', () => {
    const offsets = insertionOffsets({ rects: rowRtl(2, 100, 4), index: 0, axis: 'horizontal', size: { width: 50, height: 40 }, gap: 4, box: BOX })
    expect(offsets).toEqual([{ x: -54, y: 0 }, { x: -54, y: 0 }])
  })

  it('插入点越界时一项都不动', () => {
    const offsets = insertionOffsets({ rects: column(2), index: 5, axis: 'vertical', size: SIZE, gap: 0, box: BOX })
    expect(offsets).toEqual([{ x: 0, y: 0 }, { x: 0, y: 0 }])
  })
})

describe('跨列表插入 · 落进来的那一格', () => {
  it('插在某一项之前就占它此刻的起点', () => {
    expect(insertionSlot({ rects: column(3, 100, 8, 40), index: 1, axis: 'vertical', size: SIZE, gap: 8, box: BOX })).toEqual({ x: 0, y: 148 })
  })

  it('排到末尾时接在末项之后隔一个间距', () => {
    expect(insertionSlot({ rects: column(2, 100, 8, 40), index: 2, axis: 'vertical', size: SIZE, gap: 8, box: BOX })).toEqual({ x: 0, y: 256 })
  })

  it('空列表落在内容盒的起点', () => {
    expect(insertionSlot({ rects: [], index: 0, axis: 'vertical', size: SIZE, gap: 8, box: BOX })).toEqual({ x: 10, y: 20 })
  })

  it('水平反向排布：起点在右侧，左上角按拖入项的宽度往回退', () => {
    const size = { width: 50, height: 40 }
    const rects = rowRtl(2, 100, 4) // DOM 第 0 项在 x 104..204，第 1 项在 0..100
    expect(insertionSlot({ rects, index: 0, axis: 'horizontal', size, gap: 4, box: BOX })).toEqual({ x: 154, y: 0 })
    expect(insertionSlot({ rects, index: 2, axis: 'horizontal', size, gap: 4, box: BOX })).toEqual({ x: -54, y: 0 })
    expect(insertionSlot({ rects: [], index: 0, axis: 'horizontal', size, gap: 4, direction: -1, box: BOX })).toEqual({ x: 260, y: 20 })
  })
})
