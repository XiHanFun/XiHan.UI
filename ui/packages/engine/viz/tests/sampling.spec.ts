import { describe, expect, it } from 'vitest'
import { average, lttb, minMax, needsSampling } from '../src'
import { between, forAll, integer } from './helpers/property'

type P = readonly [number, number]
const X = (p: P): number => p[0]
const Y = (p: P): number => p[1]
const series = (ys: number[]): P[] => ys.map((y, i): P => [i, y])

/** a 是否是 b 的子序列（按引用、保持顺序）。 */
function isSubsequence<T>(a: readonly T[], b: readonly T[]): boolean {
  let j = 0
  for (const item of a) {
    while (j < b.length && b[j] !== item)
      j++
    if (j === b.length)
      return false
    j++
  }
  return true
}

describe('触发条件', () => {
  it('点数超过绘图区宽度两倍才降采样', () => {
    expect(needsSampling(1000, 500)).toBe(false)
    expect(needsSampling(1001, 500)).toBe(true)
  })
})

describe('最大三角形三桶（LTTB）', () => {
  it('保留首尾，结果恰好 threshold 个点', () => {
    const data = series(Array.from({ length: 100 }, (_, i) => Math.sin(i / 5)))
    const out = lttb(data, 10, X, Y)
    expect(out).toHaveLength(10)
    expect(out[0]).toBe(data[0])
    expect(out[9]).toBe(data[99])
  })

  it('孤立的尖峰被保留', () => {
    const ys = Array.from<number>({ length: 200 }).fill(0)
    ys[137] = 100
    const out = lttb(series(ys), 20, X, Y)
    expect(out.some(p => p[1] === 100)).toBe(true)
  })

  it('名额不少于点数时原样返回；名额为 2 只留首尾', () => {
    const data = series([1, 2, 3])
    expect(lttb(data, 3, X, Y)).toEqual(data)
    expect(lttb(series([1, 5, 2, 8]), 2, X, Y)).toEqual([[0, 1], [3, 8]])
    expect(() => lttb(data, -1, X, Y)).toThrow(/threshold/)
  })

  it('缺失的点作为断点保留，两侧各自采样', () => {
    const ys = Array.from({ length: 60 }, (_, i) => (i === 30 ? Number.NaN : i % 7))
    const out = lttb(series(ys), 12, X, Y)
    expect(out.filter(p => Number.isNaN(p[1]))).toHaveLength(1)
    const gap = out.findIndex(p => Number.isNaN(p[1]))
    expect(out[gap - 1]![0]).toBe(29)
    expect(out[gap + 1]![0]).toBe(31)
  })

  it('性质：结果是原数据的子序列，保留首尾，长度恰为名额', () => {
    forAll(300, 139, random => ({
      data: Array.from({ length: integer(random, 3, 2000) }, (_, i): P => [i, between(random, -100, 100)]),
      threshold: integer(random, 3, 300),
    }), ({ data, threshold }) => {
      const out = lttb(data, threshold, X, Y)
      expect(isSubsequence(out, data)).toBe(true)
      expect(out[0]).toBe(data[0])
      expect(out[out.length - 1]).toBe(data[data.length - 1])
      expect(out).toHaveLength(Math.min(threshold, data.length))
    })
  })
})

describe('min-max', () => {
  it('性质：全局的最小值与最大值一定保留，每桶至多四个点', () => {
    forAll(300, 149, random => ({
      data: Array.from({ length: integer(random, 10, 3000) }, (_, i): P => [i, between(random, -100, 100)]),
      buckets: integer(random, 1, 100),
    }), ({ data, buckets }) => {
      const out = minMax(data, buckets, X, Y)
      expect(isSubsequence(out, data)).toBe(true)
      const ys = data.map(Y)
      expect(out.map(Y)).toContain(Math.max(...ys))
      expect(out.map(Y)).toContain(Math.min(...ys))
      expect(out.length).toBeLessThanOrEqual(Math.min(data.length, buckets * 4))
    })
  })

  it('桶数足够时原样返回；缺失的点作为断点保留', () => {
    expect(minMax(series([1, 2, 3]), 1, X, Y)).toHaveLength(3)
    const ys = Array.from({ length: 100 }, (_, i) => (i === 50 ? Number.NaN : i))
    expect(minMax(series(ys), 5, X, Y).filter(p => Number.isNaN(p[1]))).toHaveLength(1)
  })
})

describe('average', () => {
  it('每桶取平均，缺失的点不参与', () => {
    expect(average(series([0, 2, 4, 6]), 2, X, Y)).toEqual([{ x: 0.5, y: 1 }, { x: 2.5, y: 5 }])
    expect(average(series([1, Number.NaN, 3]), 5, X, Y)).toEqual([{ x: 0, y: 1 }, { x: 2, y: 3 }])
  })
})
