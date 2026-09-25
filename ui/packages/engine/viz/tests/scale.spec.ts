import { describe, expect, it } from 'vitest'
import {
  inferDomain,
  isVizError,
  scaleBand,
  scaleDiverging,
  scaleLinear,
  scaleLog,
  scaleOrdinal,
  scalePoint,
  scalePow,
  scaleQuantile,
  scaleQuantize,
  scaleSequential,
  scaleSqrt,
  scaleSymlog,
  scaleThreshold,
  scaleTime,
  scaleUtc,
  utcIntervals,
} from '../src'
import { between, forAll, integer, magnitude } from './helpers/property'

function codeOf(run: () => unknown): string | undefined {
  try {
    run()
  }
  catch (error) {
    return isVizError(error) ? error.code : 'not-viz-error'
  }
  return undefined
}

const U = (y: number, m: number, d: number, h = 0): Date => new Date(Date.UTC(y, m, d, h))

describe('线性比例尺', () => {
  it('线性映射，定义域外按两端的线段外推', () => {
    const x = scaleLinear({ domain: [0, 10], range: [0, 100] })
    expect(x.map(2.5)).toBe(25)
    expect(x.map(-1)).toBe(-10)
    expect(x.map(12)).toBe(120)
  })

  it('钳制把定义域外的值落到值域两端，取整输出整像素', () => {
    const x = scaleLinear({ domain: [0, 10], range: [0, 100], clamp: true, round: true })
    expect(x.map(-5)).toBe(0)
    expect(x.map(20)).toBe(100)
    expect(x.map(0.26)).toBe(3)
    expect(x.invert(150)).toBe(10)
  })

  it('分段定义域：每段各自线性', () => {
    const x = scaleLinear({ domain: [0, 50, 100], range: [0, 80, 100] })
    expect(x.map(25)).toBe(40)
    expect(x.map(75)).toBe(90)
    expect(x.invert(90)).toBe(75)
  })

  it('纵轴的反向值域：大值在上', () => {
    const y = scaleLinear({ domain: [0, 100], range: [300, 0] })
    expect(y.map(0)).toBe(300)
    expect(y.map(25)).toBe(225)
    expect(y.invert(225)).toBe(25)
  })

  it('缺失值映射为 undefined；两端相等的定义域映射到值域中点', () => {
    const x = scaleLinear({ domain: [0, 1], range: [0, 10] })
    expect(x.map(Number.NaN)).toBeUndefined()
    expect(x.map(null as unknown as number)).toBeUndefined()
    expect(scaleLinear({ domain: [5, 5], range: [0, 10] }).map(5)).toBe(5)
  })

  it('非法定义域与值域立即报错', () => {
    expect(() => scaleLinear({ domain: [0, 5, 2], range: [0, 1, 2] })).toThrow(/严格单调/)
    expect(() => scaleLinear({ domain: [0, 1], range: [0, 1, 2] })).toThrow(/长度/)
    expect(() => scaleLinear({ domain: [0, Number.NaN] })).toThrow(/有限数/)
    expect(() => scaleLinear({ domain: [0] })).toThrow(/两个值/)
    expect(() => scaleLinear({ domain: [0, 1, 2], range: [0, 5, 3] }).invert(4)).toThrow(/反查/)
  })

  it('比例尺是冻结的，nice 返回新的比例尺', () => {
    const x = scaleLinear({ domain: [0.13, 0.97], range: [0, 100] })
    const nicer = x.nice()
    expect(Object.isFrozen(x)).toBe(true)
    expect(Object.isFrozen(x.domain)).toBe(true)
    expect(x.domain).toEqual([0.13, 0.97])
    expect(nicer.domain).toEqual([0.1, 1])
    expect(nicer.range).toEqual([0, 100])
  })

  it('刻度与刻度标签按定义域两端取', () => {
    const x = scaleLinear({ domain: [0, 1], range: [0, 100] })
    expect(x.ticks(5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
    expect(x.ticks(5).map(x.tickFormat('en-US', 5))).toEqual(['0.0', '0.2', '0.4', '0.6', '0.8', '1.0'])
    expect(x.tickFormat('en-US', 5, { style: 'percent' })(0.4)).toBe('40%')
  })

  it('性质：invert(map(x)) ≈ x，nice 后的定义域包含原定义域', () => {
    forAll(1000, 41, (random) => {
      const a = magnitude(random, -3, 6)
      const b = a + (random() < 0.5 ? -1 : 1) * (Math.abs(a) * between(random, 0.01, 3) + 1e-3)
      return { domain: [a, b], range: [between(random, -500, 500), between(random, 500, 1500)], x: a + (b - a) * between(random, -0.5, 1.5) }
    }, ({ domain, range, x }) => {
      const scale = scaleLinear({ domain, range })
      const pixel = scale.map(x) as number
      expect(Math.abs(scale.invert(pixel) - x)).toBeLessThanOrEqual(Math.abs(domain[1]! - domain[0]!) * 1e-9)
      const [n0, n1] = scale.nice().domain
      expect(Math.min(n0!, n1!)).toBeLessThanOrEqual(Math.min(...domain))
      expect(Math.max(n0!, n1!)).toBeGreaterThanOrEqual(Math.max(...domain))
    })
  })
})

describe('幂与平方根比例尺', () => {
  it('平方根：面积与数值成正比', () => {
    const r = scaleSqrt({ domain: [0, 100], range: [0, 10] })
    expect(r.map(25)).toBe(5)
    expect(r.map(100)).toBe(10)
    expect(r.invert(5)).toBeCloseTo(25, 12)
  })

  it('幂对负值对称', () => {
    const p = scalePow({ exponent: 2, domain: [-2, 2], range: [-4, 4] })
    expect(p.map(-1)).toBe(-1)
    expect(p.map(1)).toBe(1)
  })

  it('指数必须是正数', () => {
    expect(() => scalePow({ exponent: 0 })).toThrow(/指数/)
  })

  it('性质：invert(map(x)) ≈ x', () => {
    forAll(500, 43, random => ({ exponent: between(random, 0.2, 4), x: between(random, 0, 1000) }), ({ exponent, x }) => {
      const p = scalePow({ exponent, domain: [0, 1000], range: [0, 1] })
      expect(p.invert(p.map(x) as number)).toBeCloseTo(x, 6)
    })
  })
})

describe('对数比例尺', () => {
  it('按数量级等距', () => {
    const x = scaleLog({ domain: [1, 1000], range: [0, 3] })
    expect(x.map(10)).toBe(1)
    expect(x.map(100)).toBe(2)
    expect(x.invert(2)).toBe(100)
  })

  it('定义域含 0 或跨越正负时抛 XH_VIZ_LOG_DOMAIN', () => {
    expect(codeOf(() => scaleLog({ domain: [0, 10] }))).toBe('XH_VIZ_LOG_DOMAIN')
    expect(codeOf(() => scaleLog({ domain: [-1, 10] }))).toBe('XH_VIZ_LOG_DOMAIN')
    expect(codeOf(() => scaleLog({ domain: [1, 10], base: 1 }))).toBe('XH_VIZ_INVALID_ARGUMENT')
  })

  it('负定义域也可以', () => {
    const x = scaleLog({ domain: [-1000, -1], range: [0, 3] })
    expect(x.map(-100)).toBeCloseTo(1, 12)
    expect(x.invert(1)).toBeCloseTo(-100, 9)
    expect(x.ticks()).toEqual([-1000, -500, -200, -100, -50, -20, -10, -5, -2, -1])
  })

  it('跨度不足 3 个数量级时补 2、5 倍刻度', () => {
    expect(scaleLog({ domain: [1, 1000] }).ticks()).toEqual([1, 2, 5, 10, 20, 50, 100, 200, 500, 1000])
    expect(scaleLog({ domain: [1, 1000] }).ticks(5)).toEqual([1, 10, 100, 1000])
    expect(scaleLog({ domain: [0.01, 1] }).ticks()).toEqual([0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1])
  })

  it('跨度更大时只取底数的幂，过多时隔几个取一个', () => {
    expect(scaleLog({ domain: [1, 1e6] }).ticks()).toEqual([1, 10, 100, 1000, 1e4, 1e5, 1e6])
    expect(scaleLog({ domain: [1, 1e20] }).ticks(5)).toEqual([1, 1e4, 1e8, 1e12, 1e16, 1e20])
    expect(scaleLog({ domain: [1, 64], base: 2 }).ticks()).toEqual([1, 2, 4, 8, 16, 32, 64])
  })

  it('不足一个数量级时退回线性刻度', () => {
    expect(scaleLog({ domain: [3, 4] }).ticks(5)).toEqual([3, 3.2, 3.4, 3.6, 3.8, 4])
  })

  it('nice 取整到底数的幂', () => {
    expect(scaleLog({ domain: [3, 470] }).nice().domain).toEqual([1, 1000])
    expect(scaleLog({ domain: [470, 3] }).nice().domain).toEqual([1000, 1])
    expect(scaleLog({ domain: [-470, -3] }).nice().domain).toEqual([-1000, -1])
    expect(scaleLog({ domain: [0.003, 0.47] }).nice().domain).toEqual([0.001, 1])
  })

  it('刻度标签写全有效数字', () => {
    const x = scaleLog({ domain: [0.001, 1000] })
    expect([0.001, 1, 1000].map(x.tickFormat('en-US'))).toEqual(['0.001', '1', '1,000'])
  })

  it('性质：invert(map(x)) ≈ x', () => {
    forAll(500, 47, random => ({ a: 10 ** between(random, -5, 2), span: 10 ** between(random, 0.1, 8), t: random() }), ({ a, span, t }) => {
      const b = a * span
      const x = scaleLog({ domain: [a, b], range: [0, 1] })
      const value = a * span ** t
      expect(x.invert(x.map(value) as number) / value).toBeCloseTo(1, 9)
    })
  })
})

describe('对称对数比例尺', () => {
  it('跨 0，关于原点对称', () => {
    const x = scaleSymlog({ domain: [-100, 100], range: [-1, 1] })
    expect(x.map(0)).toBe(0)
    expect(x.map(-50)).toBeCloseTo(-(x.map(50) as number), 12)
    expect(x.invert(x.map(42) as number)).toBeCloseTo(42, 9)
    expect(() => scaleSymlog({ constant: 0 })).toThrow(/常数/)
  })
})

describe('色阶位置比例尺', () => {
  it('顺序色阶输出 t ∈ [0, 1]，始终钳制', () => {
    const t = scaleSequential({ domain: [0, 200] })
    expect(t.map(50)).toBe(0.25)
    expect(t.map(-10)).toBe(0)
    expect(t.map(900)).toBe(1)
    expect(t.clamp).toBe(true)
    expect(t.kind).toBe('sequential')
  })

  it('发散色阶的中点落在 0.5，两臂各自线性', () => {
    const t = scaleDiverging({ domain: [-10, 0, 40] })
    expect(t.map(0)).toBe(0.5)
    expect(t.map(-5)).toBe(0.25)
    expect(t.map(20)).toBe(0.75)
    expect(t.map(100)).toBe(1)
  })

  it('可以换对数或平方根变换', () => {
    expect(scaleSequential({ domain: [1, 100], transform: 'log' }).map(10)).toBe(0.5)
    expect(scaleSequential({ domain: [0, 100], transform: 'sqrt' }).map(25)).toBe(0.5)
    expect(codeOf(() => scaleSequential({ domain: [0, 100], transform: 'log' }))).toBe('XH_VIZ_LOG_DOMAIN')
  })

  it('定义域的长度必须对', () => {
    expect(() => scaleSequential({ domain: [0, 1, 2] })).toThrow(/两个值/)
    expect(() => scaleDiverging({ domain: [0, 1] })).toThrow(/三个值/)
  })
})

describe('时间比例尺', () => {
  const x = scaleUtc({ domain: [U(2026, 8, 1), U(2026, 8, 11)], range: [0, 100] })

  it('日期按时间值线性映射，invert 返回日期', () => {
    expect(x.map(U(2026, 8, 6))).toBe(50)
    expect(x.invert(50)).toEqual(U(2026, 8, 6))
    expect(x.map(new Date(Number.NaN))).toBeUndefined()
  })

  it('刻度走时间间隔，标签多尺度', () => {
    const ticks = x.ticks(5)
    expect(ticks.map(d => d.getUTCDate())).toEqual([1, 3, 5, 7, 9, 11])
    const format = x.tickFormat('en-US', 5)
    expect(ticks.map(format)).toEqual(['Sep', 'Sep 3', 'Sep 5', 'Sep 7', 'Sep 9', 'Sep 11'])
  })

  it('给定间隔时取该间隔上的全部边界', () => {
    expect(x.ticks(utcIntervals.week(1))).toEqual([U(2026, 8, 7)])
  })

  it('nice 把两端取整到刻度间隔上，原比例尺不变', () => {
    const y = scaleUtc({ domain: [U(2026, 8, 1, 5), U(2026, 8, 10, 7)], range: [0, 1] })
    expect(y.nice(10).domain).toEqual([U(2026, 8, 1), U(2026, 8, 11)])
    expect(y.domain[0]).toEqual(U(2026, 8, 1, 5))
    expect(y.nice(utcIntervals.month).domain).toEqual([U(2026, 8, 1), U(2026, 9, 1)])
  })

  it('反向定义域的刻度按降序', () => {
    const r = scaleUtc({ domain: [U(2026, 8, 11), U(2026, 8, 1)], range: [0, 100] })
    expect(r.ticks(5).map(d => d.getUTCDate())).toEqual([11, 9, 7, 5, 3, 1])
  })

  it('本地时间比例尺按本地日历取刻度', () => {
    const local = scaleTime({ domain: [new Date(2026, 8, 1), new Date(2026, 8, 3)], range: [0, 1] })
    expect(local.ticks(2).map(d => [d.getDate(), d.getHours()])).toEqual([[1, 0], [2, 0], [3, 0]])
    expect(local.kind).toBe('time')
  })

  it('定义域不是有效日期时报错', () => {
    expect(() => scaleUtc({ domain: [new Date(Number.NaN), U(2026, 0, 1)] })).toThrow(/有效日期/)
  })
})

describe('分档比例尺', () => {
  it('等宽分档', () => {
    const q = scaleQuantize({ domain: [0, 100], levels: 4 })
    expect(q.thresholds()).toEqual([25, 50, 75])
    expect([0, 24.9, 25, 99, 100, 150, -3].map(q.map)).toEqual([0, 0, 1, 3, 3, 3, 0])
    expect(q.invertExtent(1)).toEqual([25, 50])
    expect(q.range).toEqual([0, 1, 2, 3])
  })

  it('等量分档按分位数分界', () => {
    const q = scaleQuantile({ domain: [3, 1, 4, 1, 5, 9, 2, 6, null], levels: 4 })
    expect(q.thresholds()).toEqual([1.75, 3.5, 5.25])
    expect(q.map(4)).toBe(2)
    expect(q.invertExtent(0)).toEqual([1, 1.75])
    expect(q.invertExtent(3)).toEqual([5.25, 9])
  })

  it('按给定分界分档', () => {
    const t = scaleThreshold({ thresholds: [0, 10] })
    expect([-1, 0, 5, 10, 20].map(t.map)).toEqual([0, 1, 1, 2, 2])
    expect(t.invertExtent(0)).toEqual([Number.NEGATIVE_INFINITY, 0])
    expect(t.invertExtent(2)).toEqual([10, Number.POSITIVE_INFINITY])
  })

  it('非法输入立即报错', () => {
    expect(() => scaleQuantize({ levels: 0 })).toThrow(/档位数/)
    expect(() => scaleQuantize({ domain: [5, 1] })).toThrow(/定义域/)
    expect(() => scaleQuantile({ domain: [] })).toThrow(/样本/)
    expect(() => scaleThreshold({ thresholds: [1, 1] })).toThrow(/严格递增/)
    expect(() => scaleThreshold({ thresholds: [1] }).invertExtent(2)).toThrow(/越界/)
  })
})

describe('类目比例尺', () => {
  const options = { domain: ['a', 'b', 'c'], range: [0, 120] as [number, number], paddingInner: 0.2, paddingOuter: 0.1 }

  it('band：步长、带宽与起点', () => {
    const x = scaleBand(options)
    expect(x.step).toBe(40)
    expect(x.bandwidth).toBe(32)
    expect(['a', 'b', 'c'].map(x.map)).toEqual([4, 44, 84])
    expect(x.map('z')).toBeUndefined()
    expect(x.index('c')).toBe(2)
    expect(x.index('z')).toBe(-1)
  })

  it('band 反查：格子以带中心为中点、宽一个步长', () => {
    const x = scaleBand(options)
    expect(x.invert(0)).toBe('a')
    expect(x.invert(39.9)).toBe('a')
    expect(x.invert(40)).toBe('b')
    expect(x.invert(119.9)).toBe('c')
    expect(x.invert(-0.1)).toBeUndefined()
    expect(x.invert(120.1)).toBeUndefined()
  })

  it('point 与同参数的 band 同步长，点落在带中心', () => {
    const band = scaleBand(options)
    const point = scalePoint(options)
    expect(point.step).toBe(band.step)
    expect(point.bandwidth).toBe(0)
    expect(['a', 'b', 'c'].map(point.map)).toEqual([20, 60, 100])
  })

  it('反向值域：第一个类目靠近起点', () => {
    const x = scaleBand({ ...options, range: [120, 0] })
    expect(['a', 'b', 'c'].map(x.map)).toEqual([84, 44, 4])
    expect(x.invert(110)).toBe('a')
  })

  it('取整到整像素', () => {
    const x = scaleBand<string>({ domain: ['a', 'b', 'c'], range: [0, 100], paddingInner: 0.1, round: true })
    for (const key of ['a', 'b', 'c'])
      expect(Number.isInteger(x.map(key))).toBe(true)
    expect(Number.isInteger(x.bandwidth)).toBe(true)
  })

  it('重复的键与越界的边距立即报错', () => {
    expect(codeOf(() => scaleBand({ domain: ['a', 'a'] }))).toBe('XH_VIZ_DUPLICATE_KEY')
    expect(() => scaleBand({ paddingInner: 1.5 })).toThrow(/paddingInner/)
    expect(() => scaleBand({ align: -1 })).toThrow(/align/)
  })

  it('性质：带首尾相接地铺在值域内，point 恰是 band 的中线', () => {
    forAll(500, 53, (random) => {
      const n = integer(random, 1, 30)
      return {
        domain: Array.from({ length: n }, (_, i) => `k${i}`),
        range: [between(random, -100, 100), between(random, 200, 1200)] as [number, number],
        paddingInner: random(),
        paddingOuter: between(random, 0, 2),
        align: random(),
      }
    }, (opts) => {
      const band = scaleBand(opts)
      const point = scalePoint(opts)
      opts.domain.forEach((key, i) => {
        const start = band.map(key) as number
        expect(start).toBeGreaterThanOrEqual(opts.range[0] - 1e-9)
        expect(start + band.bandwidth).toBeLessThanOrEqual(opts.range[1] + 1e-9)
        expect(point.map(key)).toBeCloseTo(start + band.bandwidth / 2, 9)
        if (i > 0)
          expect(start - (band.map(opts.domain[i - 1]!) as number)).toBeCloseTo(band.step, 9)
        expect(band.invert(start + band.bandwidth / 2)).toBe(key)
      })
    })
  })
})

describe('序数比例尺', () => {
  it('第 i 个键映射到第 i 个值，没见过的键不追加', () => {
    const slot = scaleOrdinal<string, number>({ domain: ['online', 'offline'], range: [1, 2, 3] })
    expect(slot.map('offline')).toBe(2)
    expect(slot.map('retail')).toBeUndefined()
    expect(slot.domain).toEqual(['online', 'offline'])
  })

  it('值域比定义域短时报错，不循环复用', () => {
    expect(() => scaleOrdinal({ domain: ['a', 'b', 'c'], range: [1, 2] })).toThrow(/不循环/)
    expect(codeOf(() => scaleOrdinal({ domain: ['a', 'a'], range: [1, 2] }))).toBe('XH_VIZ_DUPLICATE_KEY')
  })
})

describe('定义域推断', () => {
  it('数据为空时为 [0, 1]', () => {
    expect(inferDomain([])).toEqual([0, 1])
    expect(inferDomain([null, undefined])).toEqual([0, 1])
  })

  it('柱系列所在的轴强制包含 0', () => {
    expect(inferDomain([12, 40], { bars: true })).toEqual([0, 40])
    expect(inferDomain([-12, -40], { bars: true })).toEqual([-40, 0])
    expect(inferDomain([12, 40], { bars: true, nice: true })).toEqual([0, 40])
  })

  it('柱系列所在的轴被固定成不含 0 时抛 XH_VIZ_BAR_BASELINE', () => {
    expect(codeOf(() => inferDomain([12, 40], { bars: true, min: 10 }))).toBe('XH_VIZ_BAR_BASELINE')
    expect(codeOf(() => inferDomain([-12, -40], { bars: true, max: -5 }))).toBe('XH_VIZ_BAR_BASELINE')
  })

  it('折线缺省不含 0，nice 取整两端', () => {
    expect(inferDomain([13, 47])).toEqual([13, 47])
    expect(inferDomain([13, 47], { nice: true })).toEqual([10, 50])
    expect(inferDomain([13, 47], { zero: true })).toEqual([0, 47])
  })

  it('作者固定的一端不外扩也不取整', () => {
    expect(inferDomain([13, 47], { min: 12, nice: true })).toEqual([12, 50])
    const [low, high] = inferDomain([13, 47], { max: 100, padding: 0.1 })
    expect(low).toBeCloseTo(4.3, 12)
    expect(high).toBe(100)
  })

  it('include 与外扩', () => {
    expect(inferDomain([13, 47], { include: [60] })).toEqual([13, 60])
    expect(inferDomain([0, 10], { padding: 0.05 })).toEqual([-0.5, 10.5])
    expect(inferDomain([0, 10], { padding: 0.05, zero: true })).toEqual([0, 10.5])
  })

  it('全部数据相等时向两侧展开', () => {
    expect(inferDomain([5, 5])).toEqual([2.5, 7.5])
    expect(inferDomain([0])).toEqual([-0.5, 0.5])
    expect(inferDomain([0], { zero: true })).toEqual([0, 1])
  })

  it('非法边界立即报错', () => {
    expect(() => inferDomain([1], { min: 5, max: 1 })).toThrow(/min/)
    expect(() => inferDomain([1], { padding: -1 })).toThrow(/padding/)
  })
})
