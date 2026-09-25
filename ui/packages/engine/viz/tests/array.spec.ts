import { describe, expect, it } from 'vitest'
import {
  bin,
  bisector,
  cumsum,
  deviation,
  extent,
  group,
  index,
  isVizError,
  mean,
  median,
  nice,
  quantile,
  range,
  rollup,
  sum,
  tickIncrement,
  ticks,
  tickStep,
  variance,
} from '../src'
import { between, forAll, integer, magnitude } from './helpers/property'

/** 没有浮点噪声：值与它的 15 位有效数字写法完全相等。 */
function isClean(value: number): boolean {
  return value === Number.parseFloat(value.toPrecision(15))
}

describe('统计', () => {
  it('extent 跳过缺失值，没有存在的数值时为 undefined', () => {
    expect(extent([3, null, 1, Number.NaN, undefined, 7])).toEqual([1, 7])
    expect(extent([null, Number.NaN])).toBeUndefined()
    expect(extent([])).toBeUndefined()
    expect(extent([{ v: 2 }, { v: -1 }], (d, i) => d.v * (i + 1))).toEqual([-2, 2])
  })

  it('extent 把 Infinity 当作合法数值', () => {
    expect(extent([1, Number.POSITIVE_INFINITY, -Number.POSITIVE_INFINITY])).toEqual([Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY])
  })

  it('sum 做补偿求和：0.1 加十次是 1，大数夹着的小数不丢', () => {
    expect(sum(Array.from<number>({ length: 10 }).fill(0.1))).toBe(1)
    expect(sum([1e100, 1, -1e100])).toBe(1)
    expect(sum([])).toBe(0)
    expect(sum([null, undefined, Number.NaN, 2])).toBe(2)
  })

  it('sum 遇到 Infinity 得 Infinity，不因补偿项变成 NaN', () => {
    expect(sum([1, Number.POSITIVE_INFINITY, 2])).toBe(Number.POSITIVE_INFINITY)
    expect(sum([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])).toBeNaN()
  })

  it('mean 只按存在的数值计数', () => {
    expect(mean([1, null, 3])).toBe(2)
    expect(mean([])).toBeUndefined()
  })

  it('quantile 按 R-7：与 Excel QUANTILE.INC、NumPy 缺省结果一致', () => {
    const values = [1, 2, 3, 4]
    expect(quantile(values, 0)).toBe(1)
    expect(quantile(values, 0.25)).toBe(1.75)
    expect(quantile(values, 0.5)).toBe(2.5)
    expect(quantile(values, 1)).toBe(4)
    expect(quantile([15, 20, 35, 40, 50], 0.4)).toBe(29)
    expect(quantile([5], 0.3)).toBe(5)
    expect(quantile([], 0.5)).toBeUndefined()
  })

  it('quantile 与输入顺序无关，并跳过缺失值', () => {
    expect(quantile([4, null, 1, 3, 2], 0.25)).toBe(1.75)
  })

  it('quantile 的 p 越出 [0, 1] 立即报错', () => {
    for (const p of [-0.1, 1.1, Number.NaN]) {
      try {
        quantile([1, 2], p)
        expect.unreachable()
      }
      catch (error) {
        expect(isVizError(error)).toBe(true)
        expect((error as { code: string }).code).toBe('XH_VIZ_INVALID_ARGUMENT')
      }
    }
  })

  it('median 是 0.5 分位数', () => {
    expect(median([5, 1, 3])).toBe(3)
    expect(median([4, 1, 3, 2])).toBe(2.5)
  })

  it('variance 是样本方差（分母 n − 1），少于两个数值时为 undefined', () => {
    expect(variance([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(32 / 7, 12)
    expect(deviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(Math.sqrt(32 / 7), 12)
    expect(variance([1])).toBeUndefined()
  })

  it('variance 在大偏移下仍然稳定（单遍算法不做平方和相减）', () => {
    const offset = 1e9
    expect(variance([offset + 4, offset + 7, offset + 13, offset + 16])).toBeCloseTo(30, 6)
  })

  it('cumsum 在缺失处沿用前一项的累计', () => {
    expect(Array.from(cumsum([1, null, 2, Number.NaN, 3]))).toEqual([1, 1, 3, 3, 6])
  })

  it('range 按整数下标生成，不累积误差', () => {
    expect(range(4)).toEqual([0, 1, 2, 3])
    expect(range(1, 2, 0.25)).toEqual([1, 1.25, 1.5, 1.75])
    expect(range(3, 0, -1)).toEqual([3, 2, 1])
    expect(range(0, 1, 0.1)).toHaveLength(10)
    expect(range(2, 1)).toEqual([])
  })

  it('range 的步长为 0 或非有限数时报错', () => {
    expect(() => range(0, 1, 0)).toThrow(/步长/)
    expect(() => range(0, Number.POSITIVE_INFINITY)).toThrow(/有限数/)
  })
})

describe('二分查找', () => {
  const rows = [{ x: 1 }, { x: 2 }, { x: 2 }, { x: 4 }]
  const byX = bisector((d: { x: number }) => d.x)

  it('left 落在相等者之前，right 落在相等者之后', () => {
    expect(byX.left(rows, 2)).toBe(1)
    expect(byX.right(rows, 2)).toBe(3)
    expect(byX.left(rows, 0)).toBe(0)
    expect(byX.right(rows, 9)).toBe(4)
  })

  it('center 取最近者，距离相等取前一个', () => {
    expect(byX.center(rows, 3.1)).toBe(3)
    expect(byX.center(rows, 3)).toBe(2)
    expect(byX.center(rows, -5)).toBe(0)
    expect(byX.center(rows, 99)).toBe(3)
  })

  it('日期键按时间值比较', () => {
    const days = [new Date(2026, 0, 1), new Date(2026, 0, 3), new Date(2026, 0, 9)]
    const byDate = bisector((d: Date) => d)
    expect(byDate.left(days, new Date(2026, 0, 3))).toBe(1)
    expect(byDate.center(days, new Date(2026, 0, 7))).toBe(2)
  })

  it('查找区间可以收窄', () => {
    expect(byX.left(rows, 4, 0, 2)).toBe(2)
  })
})

describe('分组', () => {
  it('group 按键首次出现的次序分组', () => {
    const out = group(['apple', 'avocado', 'banana', 'apricot'], s => s[0])
    expect([...out.keys()]).toEqual(['a', 'b'])
    expect(out.get('a')).toEqual(['apple', 'avocado', 'apricot'])
  })

  it('值相等的 Date 键归入同一组，键取首次出现的实例', () => {
    const first = new Date(2026, 8, 1)
    const out = group([{ d: first, v: 1 }, { d: new Date(2026, 8, 1), v: 2 }], r => r.d)
    expect(out.size).toBe(1)
    expect([...out.keys()][0]).toBe(first)
    expect(out.get(first)?.map(r => r.v)).toEqual([1, 2])
  })

  it('rollup 把每组归约成一个值', () => {
    const out = rollup([{ k: 'a', v: 1 }, { k: 'b', v: 2 }, { k: 'a', v: 3 }], items => sum(items, d => d.v), d => d.k)
    expect(Object.fromEntries(out)).toEqual({ a: 4, b: 2 })
  })

  it('index 遇到重复键立即报错，detail 指出两处位置', () => {
    expect(index([{ id: 'x' }, { id: 'y' }], d => d.id).get('y')).toEqual({ id: 'y' })
    try {
      index([{ id: 'x' }, { id: 'y' }, { id: 'x' }], d => d.id)
      expect.unreachable()
    }
    catch (error) {
      expect(isVizError(error)).toBe(true)
      expect(error).toMatchObject({ code: 'XH_VIZ_DUPLICATE_KEY', detail: { key: 'x', first: 0, duplicate: 2 } })
    }
  })
})

describe('刻度', () => {
  it('步长取 1、2、5 × 10 的幂', () => {
    expect(ticks(0, 10, 5)).toEqual([0, 2, 4, 6, 8, 10])
    expect(ticks(0, 100, 10)).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    expect(ticks(-1, 1, 4)).toEqual([-1, -0.5, 0, 0.5, 1])
    expect(ticks(0, 1000, 3)).toEqual([0, 500, 1000])
  })

  it('小数刻度由整数下标算出，没有 0.30000000000000004', () => {
    expect(ticks(0, 1, 10)).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1])
    expect(ticks(0.1, 0.3, 4)).toEqual([0.1, 0.15, 0.2, 0.25, 0.3])
  })

  it('反向区间得到降序刻度', () => {
    expect(ticks(10, 0, 5)).toEqual([10, 8, 6, 4, 2, 0])
    expect(tickStep(10, 0, 5)).toBe(-2)
  })

  it('退化输入：两端相等只有一个刻度，count ≤ 0 没有刻度', () => {
    expect(ticks(3, 3, 5)).toEqual([3])
    expect(ticks(0, 1, 0)).toEqual([])
    expect(ticks(0, 1, -2)).toEqual([])
    expect(tickIncrement(3, 3, 5)).toBe(0)
    expect(tickStep(0, 1, 0)).toBe(0)
  })

  it('非有限输入立即报错', () => {
    expect(() => ticks(0, Number.NaN, 5)).toThrow(/有限数/)
    expect(() => ticks(0, Number.POSITIVE_INFINITY, 5)).toThrow(/有限数/)
    expect(() => ticks(0, 1, Number.POSITIVE_INFINITY)).toThrow(/有限数/)
  })

  it('tickIncrement 在步长小于 1 时用倒数的相反数表示', () => {
    expect(tickIncrement(0, 1, 10)).toBe(-10)
    expect(tickIncrement(0, 1, 2)).toBe(-2)
    expect(tickIncrement(0, 100, 10)).toBe(10)
    expect(tickStep(0, 1, 10)).toBe(0.1)
  })

  it('nice 把两端向外取整到刻度上', () => {
    expect(nice(0.13, 0.97, 10)).toEqual([0.1, 1])
    expect(nice(-3.2, 47.8, 5)).toEqual([-10, 50])
    expect(nice(97, 3, 10)).toEqual([100, 0])
    expect(nice(5, 5, 10)).toEqual([5, 5])
  })

  it('性质：刻度落在区间内、严格单调、等距且没有浮点噪声', () => {
    forAll(2000, 7, (random) => {
      const a = magnitude(random)
      const span = Math.abs(a) * between(random, 1e-3, 5) + 1e-9
      return { start: a, stop: a + (random() < 0.5 ? span : -span), count: integer(random, 1, 30) }
    }, ({ start, stop, count }) => {
      const out = ticks(start, stop, count)
      const [low, high] = start < stop ? [start, stop] : [stop, start]
      const step = Math.abs(tickStep(start, stop, count))
      for (const t of out) {
        expect(t).toBeGreaterThanOrEqual(low)
        expect(t).toBeLessThanOrEqual(high)
        expect(isClean(t)).toBe(true)
      }
      for (let i = 1; i < out.length; i++) {
        const gap = Math.abs((out[i] as number) - (out[i - 1] as number))
        expect(Math.abs(gap - step) / step).toBeLessThan(1e-9)
        expect(start < stop ? (out[i] as number) > (out[i - 1] as number) : (out[i] as number) < (out[i - 1] as number)).toBe(true)
      }
      expect(out.length).toBeLessThanOrEqual(Math.ceil(1.6 * count) + 1)
    })
  })

  it('性质：反向区间的刻度是正向的倒序', () => {
    forAll(500, 11, random => ({ a: magnitude(random), b: magnitude(random), count: integer(random, 1, 20) }), ({ a, b, count }) => {
      expect(ticks(b, a, count)).toEqual(ticks(a, b, count).reverse())
    })
  })

  it('只要一个刻度又跨过 0 时不收敛，退回第一轮取整，区间不会被越推越大', () => {
    const [x0, x1] = nice(-9639.6, 12646.9, 1)
    expect([x0, x1]).toEqual([-20000, 20000])
  })

  it('性质：nice 后的区间总包含原区间', () => {
    forAll(2000, 19, (random) => {
      const a = magnitude(random)
      return { a, b: a + Math.abs(a) * between(random, 1e-3, 5) + 1e-6, count: integer(random, 1, 20) }
    }, ({ a, b, count }) => {
      const [x0, x1] = nice(a, b, count)
      expect(x0).toBeLessThanOrEqual(a)
      expect(x1).toBeGreaterThanOrEqual(b)
      expect(x1 - x0).toBeLessThanOrEqual((b - a) * 10 + Math.abs(tickStep(a, b, count)) * 4)
    })
  })

  it('性质：刻度不少于两个时，nice 后两端恰是刻度，再 nice 一次不变', () => {
    forAll(2000, 13, (random) => {
      const a = magnitude(random)
      return { a, b: a + Math.abs(a) * between(random, 1e-3, 5) + 1e-6, count: integer(random, 2, 20) }
    }, ({ a, b, count }) => {
      const [x0, x1] = nice(a, b, count)
      expect(x0).toBeLessThanOrEqual(a)
      expect(x1).toBeGreaterThanOrEqual(b)
      const out = ticks(x0, x1, count)
      expect(out[0]).toBe(x0)
      expect(out[out.length - 1]).toBe(x1)
      expect(nice(x0, x1, count)).toEqual([x0, x1])
    })
  })
})

describe('分箱', () => {
  it('缺省按 Sturges 定箱数，并把区间取整到刻度上', () => {
    const data = [0.3, 1.2, 2.5, 2.7, 3.1, 4.9, 5.5, 9.6]
    const bins = bin<number>({ value: d => d })(data)
    expect(bins[0]?.x0).toBe(0)
    expect(bins[bins.length - 1]?.x1).toBe(10)
    expect(bins.map(b => b.length).reduce((a, b) => a + b, 0)).toBe(data.length)
  })

  it('最后一个箱包含右端点，其余箱左闭右开', () => {
    const bins = bin<number>({ value: d => d, domain: [0, 10], thresholds: [5] })([0, 5, 10])
    expect(bins.map(b => [b.x0, b.x1, [...b]])).toEqual([[0, 5, [0]], [5, 10, [5, 10]]])
  })

  it('给定区间时区间外的项被丢弃，缺失项不进任何箱', () => {
    const bins = bin<number | null>({ value: d => d, domain: [0, 4], thresholds: 2 })([-1, 0, 1, 3, 4, 5, null])
    expect(bins.flat()).toEqual([0, 1, 3, 4])
  })

  it('所有值相等时只有一个箱', () => {
    const bins = bin<number>({ value: d => d })([2, 2, 2])
    expect(bins).toHaveLength(1)
    expect(bins[0]).toMatchObject({ x0: 2, x1: 2, length: 3 })
  })

  it('没有数据也没有区间时没有箱', () => {
    expect(bin<number>({ value: d => d })([])).toEqual([])
  })

  it('scott 与 Freedman–Diaconis 按离散程度定箱宽，集中的数据箱更少', () => {
    const tight = Array.from({ length: 200 }, (_, i) => 50 + Math.sin(i) * 2)
    const wide = Array.from({ length: 200 }, (_, i) => 50 + Math.sin(i) * 40)
    for (const rule of ['scott', 'freedman-diaconis'] as const) {
      const count = (data: number[]): number => bin<number>({ value: d => d, domain: [0, 100], thresholds: rule })(data).length
      expect(count(wide)).toBeLessThan(count(tight))
    }
  })

  it('非法区间与箱数立即报错', () => {
    expect(() => bin<number>({ value: d => d, domain: [3, 1] })).toThrow(/x0 ≤ x1/)
    expect(() => bin<number>({ value: d => d, thresholds: -1 })).toThrow(/分箱数量/)
  })

  it('性质：每个在区间内的值恰好落进一个箱，箱首尾相接、值落在箱的边界内', () => {
    forAll(500, 17, (random) => {
      const n = integer(random, 1, 300)
      const scale = magnitude(random, -3, 6)
      return { data: Array.from({ length: n }, () => random() * scale), count: integer(random, 1, 40) }
    }, ({ data, count }) => {
      const bins = bin<number>({ value: d => d, thresholds: count })(data)
      expect(bins.reduce((n, b) => n + b.length, 0)).toBe(data.length)
      bins.forEach((b, k) => {
        if (k > 0)
          expect(b.x0).toBe(bins[k - 1]?.x1)
        const last = k === bins.length - 1
        for (const v of b) {
          expect(v).toBeGreaterThanOrEqual(b.x0)
          if (last)
            expect(v).toBeLessThanOrEqual(b.x1)
          else
            expect(v).toBeLessThan(b.x1)
        }
      })
    })
  })
})
