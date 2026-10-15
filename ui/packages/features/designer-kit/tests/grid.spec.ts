import type { GridItem } from '../src'
import { describe, expect, it } from 'vitest'
import { clampToGrid, compactLayout, gridCollides, placeGridItem, removeGridItem, setGridItemRect } from '../src'

function item(id: string, x: number, y: number, w: number, h: number): GridItem {
  return { id, x, y, w, h }
}

function boxes(items: readonly GridItem[]): Record<string, [number, number, number, number]> {
  return Object.fromEntries(items.map(entry => [entry.id, [entry.x, entry.y, entry.w, entry.h]]))
}

function noOverlap(items: readonly GridItem[]): boolean {
  return items.every((a, i) => items.every((b, j) => i === j || !gridCollides(a, b)))
}

describe('clampToGrid 与 gridCollides', () => {
  it('取整并夹到网格内，其余属性原样保留', () => {
    expect(clampToGrid(item('a', 10, -1, 6, 0), 12)).toEqual(item('a', 6, 0, 6, 1))
    expect(clampToGrid(item('a', 1.4, 2.6, 3.5, 1.2), 12)).toEqual(item('a', 1, 3, 4, 1))
    expect(clampToGrid(item('a', 0, 0, 20, 2), 12)).toEqual(item('a', 0, 0, 12, 2))
    expect(clampToGrid({ x: 0, y: 0, w: 1, h: 1, tag: 'kept' }, 12).tag).toBe('kept')
  })

  it('不是有限数时抛 RangeError', () => {
    expect(() => clampToGrid(item('a', Number.NaN, 0, 1, 1), 12)).toThrow(RangeError)
    expect(() => clampToGrid(item('a', 0, 0, Number.POSITIVE_INFINITY, 1), 12)).toThrow(RangeError)
    expect(() => clampToGrid(item('a', 0, 0, 1, 1), Number.NaN)).toThrow(RangeError)
  })

  it('边相接不算重叠', () => {
    expect(gridCollides(item('a', 0, 0, 2, 2), item('b', 2, 0, 2, 2))).toBe(false)
    expect(gridCollides(item('a', 0, 0, 2, 2), item('b', 0, 2, 2, 2))).toBe(false)
    expect(gridCollides(item('a', 0, 0, 2, 2), item('b', 1, 1, 2, 2))).toBe(true)
  })
})

describe('compactLayout', () => {
  it('自上而下把每项向上移到碰到别的项为止，次序不变', () => {
    const result = compactLayout([item('a', 0, 2, 4, 2), item('b', 4, 5, 4, 2), item('c', 0, 6, 4, 2), item('d', 8, 0, 4, 1)], 12)
    expect(result.map(entry => entry.id)).toEqual(['a', 'b', 'c', 'd'])
    expect(boxes(result)).toEqual({ a: [0, 0, 4, 2], b: [4, 0, 4, 2], c: [0, 2, 4, 2], d: [8, 0, 4, 1] })
  })

  it('原本重叠的项向下推开', () => {
    expect(boxes(compactLayout([item('a', 0, 0, 4, 2), item('b', 2, 1, 4, 2)], 12))).toEqual({ a: [0, 0, 4, 2], b: [2, 2, 4, 2] })
  })

  it('结果确定、不重叠，再压实不变', () => {
    const items = [item('a', 3, 4, 5, 3), item('b', 0, 0, 12, 1), item('c', 2, 1, 3, 9), item('d', 7, 2, 5, 2), item('e', 0, 9, 2, 2)]
    const first = compactLayout(items, 12)
    expect(compactLayout(items, 12)).toEqual(first)
    expect(noOverlap(first)).toBe(true)
    expect(compactLayout(first, 12)).toEqual(first)
  })
})

describe('setGridItemRect', () => {
  const base = [item('a', 0, 0, 6, 2), item('b', 6, 0, 6, 2), item('c', 0, 2, 6, 2)]

  it('拖到别的项上：被压的项向下推开并连锁推开', () => {
    expect(boxes(setGridItemRect(base, 'b', { x: 0, y: 0 }, 12))).toEqual({ a: [0, 2, 6, 2], b: [0, 0, 6, 2], c: [0, 4, 6, 2] })
  })

  it('向下拖过下方项的顶边时两者对调；拖不到顶边时压实回原位', () => {
    const stack = [item('a', 0, 0, 6, 2), item('b', 0, 2, 6, 2)]
    expect(boxes(setGridItemRect(stack, 'a', { y: 2 }, 12))).toEqual({ a: [0, 2, 6, 2], b: [0, 0, 6, 2] })
    expect(boxes(setGridItemRect(stack, 'a', { y: 1 }, 12))).toEqual({ a: [0, 0, 6, 2], b: [0, 2, 6, 2] })
  })

  it('向上拖到上方项上时被压的项让到下面', () => {
    const stack = [item('a', 0, 0, 6, 2), item('b', 0, 2, 6, 2)]
    expect(boxes(setGridItemRect(stack, 'b', { y: 0 }, 12))).toEqual({ a: [0, 2, 6, 2], b: [0, 0, 6, 2] })
  })

  it('改大小压到旁边的项时把它推下去', () => {
    expect(boxes(setGridItemRect(base, 'a', { w: 8 }, 12))).toEqual({ a: [0, 0, 8, 2], b: [6, 2, 6, 2], c: [0, 2, 6, 2] })
  })

  it('compact: false 时不压实', () => {
    expect(boxes(setGridItemRect(base, 'c', { y: 10 }, 12, { compact: false }))).toEqual({ a: [0, 0, 6, 2], b: [6, 0, 6, 2], c: [0, 10, 6, 2] })
    expect(boxes(setGridItemRect(base, 'c', { y: 10 }, 12))).toEqual({ a: [0, 0, 6, 2], b: [6, 0, 6, 2], c: [0, 2, 6, 2] })
  })

  it('目标越界时夹回网格内，id 不存在时抛 RangeError', () => {
    expect(boxes(setGridItemRect(base, 'a', { x: 9 }, 12)).a).toEqual([6, 0, 6, 2])
    expect(() => setGridItemRect(base, 'nope', { x: 0 }, 12)).toThrow(RangeError)
  })

  it('不改输入，结果不重叠', () => {
    const before = JSON.stringify(base)
    const after = setGridItemRect(base, 'c', { x: 3, y: 0, w: 6 }, 12)
    expect(JSON.stringify(base)).toBe(before)
    expect(noOverlap(after)).toBe(true)
  })
})

describe('placeGridItem 与 removeGridItem', () => {
  const base = [item('a', 0, 0, 6, 2), item('b', 6, 0, 6, 2)]

  it('没写位置时放到第一个放得下的空位', () => {
    expect(placeGridItem(base, { id: 'n', w: 4, h: 2 }, 12).at(-1)).toEqual(item('n', 0, 2, 4, 2))
    expect(placeGridItem([item('a', 0, 0, 6, 2)], { id: 'n', w: 4, h: 1 }, 12).at(-1)).toEqual(item('n', 6, 0, 4, 1))
  })

  it('写了位置时推开碰撞的项', () => {
    expect(boxes(placeGridItem(base, { id: 'n', x: 0, y: 0, w: 12, h: 1 }, 12))).toEqual({ a: [0, 1, 6, 2], b: [6, 1, 6, 2], n: [0, 0, 12, 1] })
  })

  it('id 重复时抛 RangeError', () => {
    expect(() => placeGridItem(base, { id: 'a', w: 1, h: 1 }, 12)).toThrow(RangeError)
  })

  it('移除后缺省压实，id 不存在时抛 RangeError', () => {
    const items = [item('a', 0, 0, 6, 2), item('b', 0, 2, 6, 2)]
    expect(removeGridItem(items, 'a', 12)).toEqual([item('b', 0, 0, 6, 2)])
    expect(removeGridItem(items, 'a', 12, { compact: false })).toEqual([item('b', 0, 2, 6, 2)])
    expect(() => removeGridItem(items, 'nope', 12)).toThrow(RangeError)
  })
})
