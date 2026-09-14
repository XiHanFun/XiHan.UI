import type { DndRect } from '../src'
import { describe, expect, it } from 'vitest'
import { moveItem, projectSortable, sortableOffsets } from '../src'

/** 竖直等高列表：n 项，高 h，间距 gap。 */
function column(n: number, h = 100, gap = 0): DndRect[] {
  return Array.from({ length: n }, (_, i) => ({ x: 0, y: i * (h + gap), width: 200, height: h }))
}

/** 水平等宽列表。 */
function row(n: number, w = 100, gap = 0): DndRect[] {
  return Array.from({ length: n }, (_, i) => ({ x: i * (w + gap), y: 0, width: w, height: 40 }))
}

/** 从右往左排的水平列表：DOM 第 0 项在最右。 */
function rowRtl(n: number, w = 100): DndRect[] {
  return Array.from({ length: n }, (_, i) => ({ x: (n - 1 - i) * w, y: 0, width: w, height: 40 }))
}

const at = (y: number) => ({ x: 0, y })
const atX = (x: number) => ({ x, y: 0 })

describe('排序投影 · 竖直', () => {
  it('没动时落点就是原位，所有项都不位移', () => {
    const p = projectSortable({ rects: column(3), from: 1, delta: at(0), axis: 'vertical' })
    expect(p.to).toBe(1)
    expect(p.offsets).toEqual([at(0), at(0), at(0)])
  })

  it('中心越过下一项的中心才算越过去', () => {
    const rects = column(3) // 中心 50 / 150 / 250
    // 从第 0 项拖 99px：中心到 149，还没越过第 1 项的中心 150
    expect(projectSortable({ rects, from: 0, delta: at(99), axis: 'vertical' }).to).toBe(0)
    // 再多 2px：中心 151，越过去了
    expect(projectSortable({ rects, from: 0, delta: at(101), axis: 'vertical' }).to).toBe(1)
  })

  it('向后拖：跨过的那些项整体上移一格，被拖项跟手', () => {
    const rects = column(3)
    const p = projectSortable({ rects, from: 0, delta: at(150), axis: 'vertical' })
    expect(p.to).toBe(1)
    expect(p.offsets[0]).toEqual(at(150)) // 跟手
    expect(p.offsets[1]).toEqual(at(-100)) // 让位
    expect(p.offsets[2]).toEqual(at(0)) // 没被跨过，不动
  })

  it('向后拖到底：中间每一项都让位', () => {
    const rects = column(3)
    const p = projectSortable({ rects, from: 0, delta: at(250), axis: 'vertical' })
    expect(p.to).toBe(2)
    expect(p.offsets[1]).toEqual(at(-100))
    expect(p.offsets[2]).toEqual(at(-100))
  })

  it('向前拖：跨过的那些项整体下移一格', () => {
    const rects = column(3)
    const p = projectSortable({ rects, from: 2, delta: at(-150), axis: 'vertical' })
    expect(p.to).toBe(1)
    expect(p.offsets[1]).toEqual(at(100))
    expect(p.offsets[2]).toEqual(at(-150))
    expect(p.offsets[0]).toEqual(at(0))
  })

  it('拖出列表两端也只夹到端点，不会算出越界下标', () => {
    const rects = column(3)
    expect(projectSortable({ rects, from: 0, delta: at(99999), axis: 'vertical' }).to).toBe(2)
    expect(projectSortable({ rects, from: 2, delta: at(-99999), axis: 'vertical' }).to).toBe(0)
  })

  it('落点是连续的：不会跳过中间那一项', () => {
    // 第 1 项特别矮，但它的中心仍然是必经之路
    const rects: DndRect[] = [
      { x: 0, y: 0, width: 200, height: 100 },
      { x: 0, y: 100, width: 200, height: 20 },
      { x: 0, y: 120, width: 200, height: 100 },
    ]
    // 中心 50 → 拖 61 到 111：越过第 1 项中心 110，没越过第 2 项中心 170
    expect(projectSortable({ rects, from: 0, delta: at(61), axis: 'vertical' }).to).toBe(1)
  })

  it('中心顺序与 DOM 顺序不一致时，停在第一个没越过的那项，不跳到更远处', () => {
    // 中心 50 / 300 / 150：第 1 项被排到了第 2 项后面（换行布局误用单轴就是这个形状）
    const rects: DndRect[] = [
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 0, y: 250, width: 100, height: 100 },
      { x: 0, y: 100, width: 100, height: 100 },
    ]
    // 拖到中心 250：越不过第 1 项（中心 300），就该停下——哪怕第 2 项（中心 150）早已被越过
    expect(projectSortable({ rects, from: 0, delta: at(200), axis: 'vertical' }).to).toBe(0)
  })

  it('高度不等时让位量按相邻项的起点差算，不按被拖项的高度', () => {
    const rects: DndRect[] = [
      { x: 0, y: 0, width: 200, height: 40 },
      { x: 0, y: 40, width: 200, height: 200 },
    ]
    const p = projectSortable({ rects, from: 0, delta: at(200), axis: 'vertical' })
    expect(p.to).toBe(1)
    // 第 1 项要挪到第 0 项的起点：0 - 40 = -40
    expect(p.offsets[1]).toEqual(at(-40))
  })

  it('带间距时让位量自动含进间距，不必单独告诉它 gap 是多少', () => {
    const rects = column(2, 100, 12) // y = 0, 112
    const p = projectSortable({ rects, from: 0, delta: at(120), axis: 'vertical' })
    expect(p.to).toBe(1)
    expect(p.offsets[1]).toEqual(at(-112))
  })
})

describe('排序投影 · 水平', () => {
  it('沿 x 判落点，y 上的位移不参与', () => {
    const rects = row(3)
    const p = projectSortable({ rects, from: 0, delta: { x: 150, y: 9999 }, axis: 'horizontal' })
    expect(p.to).toBe(1)
    expect(p.offsets[1]).toEqual(atX(-100))
  })

  it('从右往左排时方向自动反过来，不必额外传 dir', () => {
    const rects = rowRtl(3) // DOM 0 在 x=200，DOM 2 在 x=0
    // 往左拖 = 沿 DOM 顺序往后
    const p = projectSortable({ rects, from: 0, delta: atX(-150), axis: 'horizontal' })
    expect(p.to).toBe(1)
    // 第 1 项要挪到第 0 项的起点：200 - 100 = +100
    expect(p.offsets[1]).toEqual(atX(100))
  })

  it('从右往左排时往右拖不会误判成往后', () => {
    const rects = rowRtl(3)
    expect(projectSortable({ rects, from: 2, delta: atX(150), axis: 'horizontal' }).to).toBe(1)
  })
})

describe('排序投影 · 换行网格', () => {
  // 2 列 × 2 行，每格 100×100
  const grid: DndRect[] = [
    { x: 0, y: 0, width: 100, height: 100 },
    { x: 100, y: 0, width: 100, height: 100 },
    { x: 0, y: 100, width: 100, height: 100 },
    { x: 100, y: 100, width: 100, height: 100 },
  ]

  it('落点取最近的那个中心，跨行也算得出来', () => {
    // 第 0 格往下拖一整行 → 落到第 2 格
    expect(projectSortable({ rects: grid, from: 0, delta: at(100), axis: 'both' }).to).toBe(2)
  })

  it('斜着拖到对角格', () => {
    expect(projectSortable({ rects: grid, from: 0, delta: { x: 100, y: 100 }, axis: 'both' }).to).toBe(3)
  })

  it('没动时仍然落在原位', () => {
    expect(projectSortable({ rects: grid, from: 2, delta: at(0), axis: 'both' }).to).toBe(2)
  })

  it('换行让位：项挪到相邻槽位，跨行时 x 与 y 同时变', () => {
    const p = projectSortable({ rects: grid, from: 0, delta: at(100), axis: 'both' })
    expect(p.to).toBe(2)
    // 第 1 格挪到第 0 格：x -100；第 2 格挪到第 1 格：x +100, y -100
    expect(p.offsets[1]).toEqual({ x: -100, y: 0 })
    expect(p.offsets[2]).toEqual({ x: 100, y: -100 })
  })
})

describe('排序投影 · 退化输入', () => {
  it('空列表', () => {
    const p = projectSortable({ rects: [], from: 0, delta: at(50), axis: 'vertical' })
    expect(p.to).toBe(0)
    expect(p.offsets).toEqual([])
  })

  it('只有一项时哪都去不了', () => {
    const p = projectSortable({ rects: column(1), from: 0, delta: at(500), axis: 'vertical' })
    expect(p.to).toBe(0)
    expect(p.offsets).toEqual([at(500)])
  })

  it('下标越界时原样返回，不抛也不算出脏数据', () => {
    const rects = column(3)
    for (const from of [-1, 3, 99, Number.NaN]) {
      const p = projectSortable({ rects, from, delta: at(150), axis: 'vertical' })
      expect(p.to).toBe(from)
      expect(p.offsets).toEqual([at(0), at(0), at(0)])
    }
  })

  it('所有项挤在同一个坐标上时不动，也不进死循环', () => {
    const rects: DndRect[] = Array.from({ length: 3 }, () => ({ x: 0, y: 0, width: 10, height: 10 }))
    expect(projectSortable({ rects, from: 1, delta: at(50), axis: 'vertical' }).to).toBe(1)
  })
})

describe('挪动数组元素', () => {
  it('往后挪', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd'])
  })

  it('往前挪', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c'])
  })

  it('挪到原位等于不动', () => {
    expect(moveItem(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'b', 'c'])
  })

  it('不改原数组', () => {
    const list = ['a', 'b', 'c']
    moveItem(list, 0, 2)
    expect(list).toEqual(['a', 'b', 'c'])
  })

  it('下标越界时原样返回一份拷贝', () => {
    const list = ['a', 'b', 'c']
    for (const [from, to] of [[-1, 1], [5, 1], [1, -1], [1, 5]] as const) {
      const out = moveItem(list, from, to)
      expect(out).toEqual(list)
      expect(out).not.toBe(list)
    }
  })

  it('端到端：投影出来的落点喂给它，顺序与手排的一致', () => {
    const rects = column(4)
    const list = ['a', 'b', 'c', 'd']
    const { to } = projectSortable({ rects, from: 0, delta: at(250), axis: 'vertical' })
    expect(moveItem(list, 0, to)).toEqual(['b', 'c', 'a', 'd'])
  })
})

describe('让位计算 · 键盘拖拽（没有指针位移）', () => {
  it('被拖项直接落到目标槽位的起点', () => {
    const rects = column(3)
    const offsets = sortableOffsets({ rects, from: 0, to: 2 })
    expect(offsets[0]).toEqual(at(200)) // 落到第 2 格起点
    expect(offsets[1]).toEqual(at(-100))
    expect(offsets[2]).toEqual(at(-100))
  })

  it('往前挪同样落到起点', () => {
    const rects = column(3)
    const offsets = sortableOffsets({ rects, from: 2, to: 0 })
    expect(offsets[2]).toEqual(at(-200))
    expect(offsets[0]).toEqual(at(100))
    expect(offsets[1]).toEqual(at(100))
  })

  it('原地不动时全零', () => {
    expect(sortableOffsets({ rects: column(3), from: 1, to: 1 })).toEqual([at(0), at(0), at(0)])
  })

  it('与指针模式共用同一套让位规则：除被拖项外，两条路径给出的位移一致', () => {
    const rects = column(4)
    const pointer = projectSortable({ rects, from: 0, delta: at(250), axis: 'vertical' })
    const keyboard = sortableOffsets({ rects, from: 0, to: pointer.to })
    expect(pointer.to).toBe(2)
    expect(keyboard.slice(1)).toEqual(pointer.offsets.slice(1))
  })

  it('下标越界时全零，不抛', () => {
    expect(sortableOffsets({ rects: column(2), from: 0, to: 9 })).toEqual([at(0), at(0)])
    expect(sortableOffsets({ rects: [], from: 0, to: 0 })).toEqual([])
  })
})
