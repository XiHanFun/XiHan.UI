import { describe, expect, it } from 'vitest'
import { computePlacement } from '../src/compute'

/**
 * start / end 是逻辑对齐，不是「左 / 右」。RTL 下行内轴要翻过来：
 * start 与锚点的右缘齐平。块轴（left / right 两侧的纵向对齐）与文字方向无关，一动不动。
 */

const anchor = { x: 100, y: 100, width: 200, height: 40 }
const floating = { width: 80, height: 30 }
const clip = { top: 0, right: 1000, bottom: 1000, left: 0 }
const base = { anchor, floating, clip, offset: 0, flip: false, shift: false, padding: 0 }

function at(placement: string, dir?: 'ltr' | 'rtl') {
  return computePlacement({ ...base, placement: placement as never, dir })
}

describe('行内轴：top / bottom 两侧的横向对齐随方向翻转', () => {
  it('lTR：start 贴左缘、end 贴右缘', () => {
    expect(at('bottom-start').x).toBe(100)
    expect(at('bottom-end').x).toBe(100 + 200 - 80)
  })

  it('rTL：start 贴右缘、end 贴左缘', () => {
    expect(at('bottom-start', 'rtl').x).toBe(100 + 200 - 80)
    expect(at('bottom-end', 'rtl').x).toBe(100)
  })

  it('top 侧同理', () => {
    expect(at('top-start', 'rtl').x).toBe(100 + 200 - 80)
    expect(at('top-end', 'rtl').x).toBe(100)
  })

  it('center 不受方向影响', () => {
    expect(at('bottom', 'rtl').x).toBe(at('bottom').x)
  })

  it('不传 dir 与传 ltr 逐字相同', () => {
    for (const p of ['bottom-start', 'bottom-end', 'top-start', 'top-end'])
      expect(at(p, 'ltr')).toEqual(at(p))
  })
})

describe('块轴：left / right 两侧的纵向对齐与方向无关', () => {
  it('rTL 下 y 一动不动', () => {
    for (const p of ['left-start', 'left-end', 'right-start', 'right-end', 'left', 'right'])
      expect(at(p, 'rtl').y).toBe(at(p).y)
  })

  it('rTL 下 x 也一动不动（主轴由 side 决定，不是对齐的事）', () => {
    for (const p of ['left-start', 'right-end'])
      expect(at(p, 'rtl').x).toBe(at(p).x)
  })
})
