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

describe('箭头落点随方向翻面', () => {
  const arrow = { size: 8, padding: 4 }
  function arrowAt(placement: string, dir?: 'ltr' | 'rtl') {
    return computePlacement({ ...base, placement: placement as never, dir, arrow }).arrow!
  }

  // 落点量的是距行首缘的距离：LTR 下行首在左，RTL 下在右。
  // 两种方向下都该指着锚点中心——换算回物理坐标验它，而不是拿两个方向互比：
  // RTL 会把浮层自己也挪到另一侧，两者不是简单镜像
  it('rTL 下换算回物理坐标仍对着锚点中心', () => {
    // 浮层取得比锚点宽，锚点中心必落在浮层内，钳位不介入，指向关系才验得干净
    const wide = { width: 240, height: 30 }
    for (const p of ['bottom', 'bottom-start', 'bottom-end']) {
      const result = computePlacement({ ...base, floating: wide, placement: p as never, dir: 'rtl', arrow })
      const physical = result.x + (wide.width - result.arrow!.x!)
      expect(physical).toBe(anchor.x + anchor.width / 2)
    }
  })

  it('锚点落在浮层之外时钳到最近的合法点，绝不指到浮层外面', () => {
    const margin = arrow.size / 2 + arrow.padding
    const result = computePlacement({ ...base, placement: 'bottom-start', dir: 'rtl', arrow })
    // RTL 的 start 把浮层挪到锚点右缘，锚点中心因此落在浮层行首缘之外
    expect(result.arrow!.x).toBe(floating.width - margin)
  })

  it('块轴不翻：left / right 两侧的落点与 LTR 逐字相同', () => {
    for (const p of ['left', 'right', 'right-start'])
      expect(arrowAt(p, 'rtl').y).toBe(arrowAt(p).y)
  })
})
