import type { ArcParams, StackOffset } from '../src'
import { describe, expect, it } from 'vitest'
import { arc, arcCentroid, foldSmall, isVizError, pie, roundedBar, stack, symbol, SYMBOL_NAMES } from '../src'
import { flatten } from './helpers/flatten'
import { between, forAll, integer } from './helpers/property'

const TAU = 2 * Math.PI

function areaOf(draw: (sink: ReturnType<typeof flatten>) => void, steps = 512): number {
  const sink = flatten(steps)
  draw(sink)
  return sink.area()
}

function codeOf(run: () => unknown): string | undefined {
  try {
    run()
  }
  catch (error) {
    return isVizError(error) ? error.code : 'other'
  }
  return undefined
}

describe('弧', () => {
  it('扇区：从 12 点方向顺时针', () => {
    expect(arc({ innerRadius: 0, outerRadius: 10, startAngle: 0, endAngle: Math.PI / 2 })).toBe('M0,-10A10,10,0,0,1,10,0L0,0Z')
  })

  it('环段：外弧顺时针、内弧逆时针', () => {
    expect(arc({ innerRadius: 5, outerRadius: 10, startAngle: 0, endAngle: Math.PI / 2 })).toBe('M0,-10A10,10,0,0,1,10,0L5,0A5,5,0,0,0,0,-5Z')
  })

  it('整圈的环是外圆加反向的内圆', () => {
    expect(areaOf(sink => arc({ innerRadius: 5, outerRadius: 10, startAngle: 0, endAngle: TAU }, sink))).toBeCloseTo(Math.PI * 75, 0)
  })

  it('性质：不带间隙与圆角时面积等于扇形公式', () => {
    forAll(300, 89, random => ({
      innerRadius: random() < 0.3 ? 0 : between(random, 0, 50),
      outerRadius: between(random, 60, 200),
      startAngle: between(random, -TAU, TAU),
      sweep: between(random, 0.05, TAU - 0.05) * (random() < 0.5 ? -1 : 1),
    }), ({ innerRadius, outerRadius, startAngle, sweep }) => {
      const params: ArcParams = { innerRadius, outerRadius, startAngle, endAngle: startAngle + sweep }
      const expected = (Math.abs(sweep) / 2) * (outerRadius ** 2 - innerRadius ** 2)
      expect(areaOf(sink => arc(params, sink)) / expected).toBeCloseTo(1, 3)
      expect(arc(params).endsWith('Z')).toBe(true)
    })
  })

  it('间隙是与径向边平行的等宽条带：边上的点到径向线的距离恒为间隙的一半', () => {
    const padRadius = 100
    const padAngle = 4 / padRadius
    const h = padRadius * Math.sin(padAngle / 2)
    const sink = flatten()
    arc({ innerRadius: 40, outerRadius: 120, startAngle: 0, endAngle: 1, padAngle, padRadius }, sink)
    const poly = sink.subpaths[0]!
    // 起点在 startAngle 一侧的边上；径向线沿 12 点方向，即 x = 0
    expect(poly[0]![0]).toBeCloseTo(h, 9)
    const innerEdge = poly.filter(([x, y]) => Math.abs(x - h) < 1e-6 && y < 0)
    expect(innerEdge.length).toBeGreaterThanOrEqual(2)
  })

  it('间隙让面积减小约两条边长 × 间隙半宽', () => {
    const base: ArcParams = { innerRadius: 40, outerRadius: 120, startAngle: 0, endAngle: 1.5 }
    const plain = areaOf(sink => arc(base, sink))
    const padded = areaOf(sink => arc({ ...base, padAngle: 0.04, padRadius: 100 }, sink))
    const strip = 2 * (120 - 40) * 100 * Math.sin(0.02)
    expect(plain - padded).toBeCloseTo(strip, -1)
  })

  it('饼的扇区带间隙时尖端落在两条边线的交点，间隙一直延伸到圆心', () => {
    const sink = flatten()
    arc({ innerRadius: 0, outerRadius: 100, startAngle: 0, endAngle: Math.PI / 2, padAngle: 0.04, padRadius: 100 }, sink)
    const h = 100 * Math.sin(0.02)
    const tip = sink.subpaths[0]!.find(([x, y]) => Math.abs(x - h) < 1e-6 && Math.abs(y + h) < 1e-6)
    expect(tip).toBeDefined()
  })

  it('实心扇区的尖端也按圆角半径倒圆：路径不再经过边线交点，削掉的面积合乎两切线夹一段圆弧', () => {
    const base: ArcParams = { innerRadius: 0, outerRadius: 100, startAngle: 0, endAngle: Math.PI / 2, padAngle: 0.04, padRadius: 100 }
    const h = 100 * Math.sin(0.02)
    const sink = flatten()
    arc({ ...base, cornerRadius: 4 }, sink)
    const near = sink.subpaths[0]!.filter(([x, y]) => Math.hypot(x - h, y + h) < 0.5)
    expect(near).toHaveLength(0)
    // 直角尖端倒圆削掉 (1 − π/4)c²；两个外角各削掉不到这么多
    const plain = areaOf(k => arc(base, k))
    const rounded = areaOf(k => arc({ ...base, cornerRadius: 4 }, k))
    expect(plain - rounded).toBeGreaterThan((1 - Math.PI / 4) * 16 * 0.9)
    expect(plain - rounded).toBeLessThan(3 * (1 - Math.PI / 4) * 16 * 1.1)
  })

  it('不小于半圈的实心扇区尖端是凹角，保持尖', () => {
    const sink = flatten()
    arc({ innerRadius: 0, outerRadius: 100, startAngle: 0, endAngle: 4, cornerRadius: 4 }, sink)
    expect(sink.subpaths[0]!.some(([x, y]) => Math.hypot(x, y) < 1e-6)).toBe(true)
  })

  it('圆角让面积单调减小，超大的圆角被夹到可容纳的范围', () => {
    const base: ArcParams = { innerRadius: 50, outerRadius: 100, startAngle: 0, endAngle: 1 }
    const areas = [0, 4, 8, 16, 1000].map(cornerRadius => areaOf(sink => arc({ ...base, cornerRadius }, sink)))
    for (let i = 1; i < areas.length; i++)
      expect(areas[i]!).toBeLessThanOrEqual(areas[i - 1]! + 1e-6)
    expect(areas[4]!).toBeGreaterThan(0)
    // 四个 90° 左右的角，每个最多削掉 (1 − π/4)c²
    expect(areas[0]! - areas[1]!).toBeLessThan(4 * (1 - Math.PI / 4) * 16 * 1.5)
  })

  it('性质：带间隙与圆角的弧总是闭合，且落在外圆之内', () => {
    forAll(300, 97, random => ({
      innerRadius: random() < 0.3 ? 0 : between(random, 0, 80),
      outerRadius: between(random, 90, 200),
      startAngle: between(random, -3, 3),
      sweep: between(random, 0.01, 6) * (random() < 0.5 ? -1 : 1),
      padAngle: between(random, 0, 0.1),
      cornerRadius: between(random, 0, 40),
    }), ({ sweep, startAngle, ...rest }) => {
      const params: ArcParams = { ...rest, startAngle, endAngle: startAngle + sweep }
      const d = arc(params)
      expect(d.endsWith('Z')).toBe(true)
      const sink = flatten()
      arc(params, sink)
      for (const [x, y] of sink.points())
        expect(Math.hypot(x, y)).toBeLessThanOrEqual(params.outerRadius + 1e-6)
    })
  })

  it('间隙吃掉整个扇区时只留一个点', () => {
    expect(arc({ innerRadius: 0, outerRadius: 10, startAngle: 0, endAngle: 0.01, padAngle: 0.5, padRadius: 10 })).toMatch(/^M[^A]*Z$/)
  })

  it('中心点在中间角度、内外半径的中点', () => {
    const [x, y] = arcCentroid({ innerRadius: 20, outerRadius: 40, startAngle: 0, endAngle: Math.PI })
    expect(x).toBeCloseTo(30, 9)
    expect(y).toBeCloseTo(0, 9)
  })

  it('负半径与非有限参数立即报错', () => {
    expect(() => arc({ innerRadius: -1, outerRadius: 10, startAngle: 0, endAngle: 1 })).toThrow(/半径/)
    expect(() => arc({ innerRadius: 0, outerRadius: 10, startAngle: 0, endAngle: Number.NaN })).toThrow(/有限数/)
  })
})

describe('饼布局', () => {
  it('按值分配角度，结果按输入顺序', () => {
    const slices = pie([1, 2, 1], { value: d => d })
    expect(slices.map(s => [s.startAngle, s.endAngle])).toEqual([[0, Math.PI / 2], [Math.PI / 2, (3 * Math.PI) / 2], [(3 * Math.PI) / 2, TAU]])
  })

  it('降序排角度，结果仍按输入顺序', () => {
    const slices = pie([1, 3, 2], { value: d => d, sort: 'descending' })
    expect(slices[1]!.startAngle).toBe(0)
    expect(slices[2]!.startAngle).toBeCloseTo(Math.PI, 12)
    expect(slices.map(s => s.index)).toEqual([0, 1, 2])
  })

  it('负值抛 XH_VIZ_NEGATIVE_SHARE，缺失值记为 0', () => {
    expect(codeOf(() => pie([1, -1], { value: d => d }))).toBe('XH_VIZ_NEGATIVE_SHARE')
    const slices = pie([1, null, 1], { value: d => d })
    expect(slices[1]!.endAngle - slices[1]!.startAngle).toBe(0)
  })

  it('逆时针与半圈', () => {
    const slices = pie([1, 1], { value: d => d, startAngle: -Math.PI / 2, endAngle: Math.PI / 2 })
    expect(slices[1]!.endAngle).toBe(Math.PI / 2)
    const ccw = pie([1, 1], { value: d => d, endAngle: -TAU })
    expect(ccw[1]!.endAngle).toBe(-TAU)
  })

  it('空数组没有扇区', () => {
    expect(pie([], { value: (d: number) => d })).toEqual([])
  })

  it('性质：各扇区角度之和为 2π，扣除间隙后与值成正比', () => {
    forAll(500, 101, random => ({
      values: Array.from({ length: integer(random, 1, 12) }, () => (random() < 0.1 ? 0 : between(random, 0, 100))),
      padAngle: random() < 0.5 ? 0 : between(random, 0, 0.1),
    }), ({ values, padAngle }) => {
      const slices = pie(values, { value: d => d, padAngle })
      const total = slices.reduce((s, x) => s + (x.endAngle - x.startAngle), 0)
      expect(total).toBeCloseTo(TAU, 9)
      const sum = values.reduce((a, b) => a + b, 0)
      if (sum > 0) {
        const k = (TAU - values.length * slices[0]!.padAngle) / sum
        slices.forEach(s => expect(s.endAngle - s.startAngle - s.padAngle).toBeCloseTo(s.value * k, 9))
      }
    })
  })
})

describe('并入「其他」', () => {
  const rows = [{ v: 50 }, { v: 2 }, { v: 30 }, { v: 1 }, { v: 15 }, { v: 2 }]

  it('超过最大扇区数时从小到大并入，保留输入顺序', () => {
    const out = foldSmall(rows, { value: d => d.v, maxSlices: 4 })
    expect(out.kept.map(d => d.v)).toEqual([50, 30, 15])
    expect(out.folded.map(d => d.v)).toEqual([2, 1, 2])
    expect(out.otherValue).toBe(5)
  })

  it('占比低于门槛的并入；只剩一项可并时保留它本身', () => {
    expect(foldSmall(rows, { value: d => d.v, minShare: 0.03 }).folded.map(d => d.v)).toEqual([2, 1, 2])
    expect(foldSmall([{ v: 99 }, { v: 1 }], { value: d => d.v, minShare: 0.05 }).folded).toEqual([])
  })

  it('非法参数报错', () => {
    expect(() => foldSmall(rows, { value: d => d.v, maxSlices: 1 })).toThrow(/maxSlices/)
    expect(codeOf(() => foldSmall([{ v: -1 }], { value: d => d.v }))).toBe('XH_VIZ_NEGATIVE_SHARE')
  })
})

describe('堆叠', () => {
  const rows = [{ a: 1, b: 2, c: 3 }, { a: 4, b: 0, c: 1 }]
  const value = (row: Record<string, number>, key: string): number => row[key] as number

  it('从 0 起逐段累加，最外层的段做标记', () => {
    const out = stack(rows, { keys: ['a', 'b', 'c'], value })
    expect(out.map(s => s.segments.map(g => [g.y0, g.y1]))).toEqual([
      [[0, 1], [0, 4]],
      [[1, 3], [4, 4]],
      [[3, 6], [4, 5]],
    ])
    expect(out[2]!.segments.map(g => g.outermost)).toEqual([true, true])
    expect(out[1]!.segments[1]!.outermost).toBe(false)
  })

  it('expand 把每列归一到 [0, 1]，负值报错', () => {
    const out = stack(rows, { keys: ['a', 'b', 'c'], value, offset: 'expand' })
    expect(out[2]!.segments.map(g => g.y1)).toEqual([1, 1])
    expect(codeOf(() => stack([{ a: -1 }], { keys: ['a'], value, offset: 'expand' }))).toBe('XH_VIZ_NEGATIVE_SHARE')
  })

  it('diverging 正值向上、负值向下各自累加，两端各有一个最外层段', () => {
    const out = stack([{ a: 3, b: -2, c: 4, d: -1 }], { keys: ['a', 'b', 'c', 'd'], value, offset: 'diverging' })
    expect(out.map(s => [s.segments[0]!.y0, s.segments[0]!.y1])).toEqual([[0, 3], [0, -2], [3, 7], [-2, -3]])
    expect(out.map(s => s.segments[0]!.outermost)).toEqual([false, false, true, true])
  })

  it('缺失的值记为不画的空段', () => {
    const out = stack([{ a: 1, b: Number.NaN }], { keys: ['a', 'b'], value })
    expect(out[1]!.segments[0]).toMatchObject({ y0: 1, y1: 1, defined: false, outermost: false })
  })

  it('次序', () => {
    const data = [{ a: 1, b: 5, c: 3 }, { a: 9, b: 1, c: 3 }]
    const orderOf = (order: 'ascending' | 'descending' | 'reverse' | 'appearance' | 'insideOut'): string[] =>
      stack(data, { keys: ['a', 'b', 'c'], value, order }).sort((x, y) => x.order - y.order).map(s => s.key)
    expect(orderOf('ascending')).toEqual(['b', 'c', 'a'])
    // b 与 c 的总量相同，按键的先后
    expect(orderOf('descending')).toEqual(['a', 'b', 'c'])
    expect(orderOf('reverse')).toEqual(['c', 'b', 'a'])
    expect(orderOf('appearance')).toEqual(['b', 'c', 'a'])
    expect(orderOf('insideOut')).toHaveLength(3)
  })

  it('重复的键报错', () => {
    expect(codeOf(() => stack(rows, { keys: ['a', 'a'], value }))).toBe('XH_VIZ_DUPLICATE_KEY')
  })

  it('性质：各段之和守恒——每列上下两端之差等于该列的总量', () => {
    forAll(300, 103, (random) => {
      const keys = ['k0', 'k1', 'k2', 'k3', 'k4'].slice(0, integer(random, 1, 5))
      const rowsOf = Array.from({ length: integer(random, 1, 15) }, () =>
        Object.fromEntries(keys.map(k => [k, between(random, 0, 100)])))
      const offset = (['none', 'expand', 'silhouette', 'wiggle'] as StackOffset[])[integer(random, 0, 3)]!
      return { keys, rows: rowsOf, offset }
    }, ({ keys, rows: data, offset }) => {
      const out = stack(data, { keys, value, offset })
      data.forEach((row, j) => {
        const low = Math.min(...out.map(s => s.segments[j]!.y0))
        const high = Math.max(...out.map(s => s.segments[j]!.y1))
        const total = keys.reduce((sum, k) => sum + (row[k] as number), 0)
        expect(high - low).toBeCloseTo(offset === 'expand' ? (total > 0 ? 1 : 0) : total, 6)
        out.forEach(s => expect(s.segments[j]!.y1 - s.segments[j]!.y0).toBeCloseTo(offset === 'expand' ? (row[s.key] as number) / total : (row[s.key] as number), 6))
      })
    })
  })

  it('性质：diverging 的正向顶端是正值之和，负向底端是负值之和', () => {
    forAll(300, 107, (random) => {
      const keys = ['a', 'b', 'c', 'd']
      return Array.from({ length: integer(random, 1, 10) }, () => Object.fromEntries(keys.map(k => [k, between(random, -50, 50)])))
    }, (data) => {
      const out = stack(data, { keys: ['a', 'b', 'c', 'd'], value, offset: 'diverging' })
      data.forEach((row, j) => {
        const values = Object.values(row) as number[]
        expect(Math.max(0, ...out.map(s => s.segments[j]!.y1))).toBeCloseTo(values.filter(v => v > 0).reduce((a, b) => a + b, 0), 9)
        expect(Math.min(0, ...out.map(s => s.segments[j]!.y1))).toBeCloseTo(values.filter(v => v < 0).reduce((a, b) => a + b, 0), 9)
      })
    })
  })

  it('性质：wiggle 的加权摆动不大于 silhouette', () => {
    /** Σ_i Σ_j f_i · (各层中线的斜率)²：流图要最小化的量。 */
    const wiggle = (out: ReturnType<typeof stack<Record<string, number>>>): number => {
      let total = 0
      for (const s of out) {
        for (let j = 1; j < s.segments.length; j++) {
          const mid = (g: { y0: number, y1: number }): number => (g.y0 + g.y1) / 2
          const slope = mid(s.segments[j]!) - mid(s.segments[j - 1]!)
          total += (s.segments[j]!.y1 - s.segments[j]!.y0) * slope * slope
        }
      }
      return total
    }
    forAll(200, 109, (random) => {
      const keys = ['a', 'b', 'c', 'd', 'e']
      return Array.from({ length: integer(random, 3, 20) }, () => Object.fromEntries(keys.map(k => [k, between(random, 0, 30)])))
    }, (data) => {
      const keys = ['a', 'b', 'c', 'd', 'e']
      expect(wiggle(stack(data, { keys, value, offset: 'wiggle' }))).toBeLessThanOrEqual(wiggle(stack(data, { keys, value, offset: 'silhouette' })) + 1e-6)
    })
  })
})

describe('符号', () => {
  it('八个符号，与色槽一一对应', () => {
    expect(SYMBOL_NAMES).toEqual(['circle', 'square', 'diamond', 'triangle', 'triangleDown', 'cross', 'star', 'wye'])
  })

  it('性质：每个符号的面积都等于给定的尺寸（视觉等重）', () => {
    for (const name of SYMBOL_NAMES) {
      for (const size of [16, 64, 300]) {
        const area = areaOf(sink => symbol(name, size, sink), 2048)
        expect(area / size).toBeCloseTo(1, 3)
      }
    }
  })

  it('尺寸为负、未知的符号立即报错', () => {
    expect(() => symbol('circle', -1)).toThrow(/面积/)
    expect(() => symbol('heart' as 'circle', 10)).toThrow(/未知/)
  })

  it('正方形的路径', () => {
    expect(symbol('square', 16)).toBe('M-2,-2L2,-2L2,2L-2,2Z')
  })
})

describe('圆角柱', () => {
  const rect = { x: 0, y: 0, width: 20, height: 100 }

  it('纵向正值柱：只圆顶端两角，面积少两个圆角的余量', () => {
    const d = roundedBar(rect, { radius: 4, orientation: 'vertical', baseline: 'end' })
    expect(d.startsWith('M4,0')).toBe(true)
    const area = areaOf(sink => roundedBar(rect, { radius: 4, orientation: 'vertical', baseline: 'end' }, sink))
    expect(area).toBeCloseTo(2000 - 2 * (1 - Math.PI / 4) * 16, 1)
  })

  it('负值柱的圆角在下端，横向柱在远端', () => {
    const sink = flatten()
    roundedBar(rect, { radius: 4, orientation: 'vertical', baseline: 'start' }, sink)
    const top = sink.points().filter(([, y]) => y === 0)
    expect(top.map(([x]) => x).sort((a, b) => a - b)).toEqual([0, 20])
    expect(roundedBar({ x: 0, y: 0, width: 100, height: 20 }, { radius: 4, orientation: 'horizontal', baseline: 'start' }, flatten())).toBeUndefined()
  })

  it('半径夹到厚度一半与长度', () => {
    const thin = areaOf(sink => roundedBar({ x: 0, y: 0, width: 6, height: 100 }, { radius: 50, orientation: 'vertical', baseline: 'end' }, sink))
    expect(thin).toBeCloseTo(600 - 2 * (1 - Math.PI / 4) * 9, 1)
    expect(roundedBar({ x: 0, y: 0, width: 20, height: 2 }, { radius: 8, orientation: 'vertical', baseline: 'end' })).toMatch(/^M2,0/)
  })

  it('宽高为负时换成等价矩形；长度为 0 不画；半径为 0 画直角矩形', () => {
    expect(roundedBar({ x: 20, y: 100, width: -20, height: -100 }, { radius: 0, orientation: 'vertical', baseline: 'end' })).toBe('M0,0h20v100h-20Z')
    expect(roundedBar({ x: 0, y: 0, width: 20, height: 0 }, { radius: 4, orientation: 'vertical', baseline: 'end' })).toBe('')
    expect(() => roundedBar(rect, { radius: -1, orientation: 'vertical', baseline: 'end' })).toThrow(/圆角/)
  })
})
