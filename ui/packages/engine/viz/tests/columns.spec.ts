import type { ColumnSource } from '../src/columns'
import { describe, expect, it, vi } from 'vitest'
import { utcIntervals } from '../src'
import {
  bisectLeft,
  bisectRight,
  bucketOhlc,
  bucketPeak,
  bucketSize,
  createColumnStore,
  createExtentIndex,
  createPointIndex,
  decimateLine,
  EXTENT_BLOCK,
  isAscending,
  isColumnSource,
  nearestIndex,
  ordinalTimeTicks,
  thinPoints,
} from '../src/columns'
import { forAll, integer, seeded } from './helpers/property'

/** 列视图拷成普通数组，便于比较。 */
function values(source: ColumnSource, field: string): number[] {
  return [...(source.column(field) ?? [])]
}

describe('列式数据仓', () => {
  it('逐行与按列追加：日期取时间值，缺失与非有限数写 NaN，没声明的字段不读', () => {
    const store = createColumnStore({ fields: ['t', 'v'] })
    store.append({ t: new Date(1000), v: 1, extra: 9 } as never)
    store.append([{ t: 2000, v: null }, { t: 3000, v: Number.POSITIVE_INFINITY }])
    store.appendColumns({ t: [4000, 5000], v: new Float64Array([4, 5]) })
    expect(store.length).toBe(5)
    expect(values(store, 't')).toEqual([1000, 2000, 3000, 4000, 5000])
    expect(values(store, 'v')).toEqual([1, Number.NaN, Number.NaN, 4, 5])
    expect(store.column('extra')).toBeUndefined()
  })

  it('一次调用只通知一次，版本随之加一；退订后不再通知', () => {
    const store = createColumnStore({ fields: ['v'] })
    const listener = vi.fn()
    const stop = store.subscribe(listener)
    store.append([{ v: 1 }, { v: 2 }, { v: 3 }])
    expect(listener).toHaveBeenCalledTimes(1)
    expect(store.version).toBe(1)
    store.setLast({ v: 30 })
    store.shift(1)
    expect(listener).toHaveBeenCalledTimes(3)
    stop()
    store.append({ v: 4 })
    expect(listener).toHaveBeenCalledTimes(3)
    expect(values(store, 'v')).toEqual([2, 30, 4])
  })

  it('设了上限时从头部挤掉最旧的行，序号接着往后数；数据段挪回开头后仍连续', () => {
    const store = createColumnStore({ fields: ['v'], capacity: 5 })
    for (let i = 0; i < 5000; i++)
      store.append({ v: i })
    expect(store.length).toBe(5)
    expect(store.start).toBe(4995)
    expect(values(store, 'v')).toEqual([4995, 4996, 4997, 4998, 4999])
  })

  it('初始数据超过上限时只留最后几行，前面的算作已滑出', () => {
    const store = createColumnStore({ fields: ['v'], capacity: 3, columns: { v: [1, 2, 3, 4, 5] } })
    expect(store.start).toBe(2)
    expect(values(store, 'v')).toEqual([3, 4, 5])
  })

  it('不设上限时 Float64Array 直接接管、不复制；写满后追加再扩容', () => {
    const column = new Float64Array([1, 2, 3])
    const store = createColumnStore({ fields: ['v'], columns: { v: column } })
    expect(store.column('v')!.buffer).toBe(column.buffer)
    store.append({ v: 4 })
    expect(values(store, 'v')).toEqual([1, 2, 3, 4])
    expect(column[0]).toBe(1)
  })

  it('setLast 只改写给了的字段；清空后序号不回退、epoch 加一', () => {
    const store = createColumnStore({ fields: ['o', 'c'] })
    store.append([{ o: 1, c: 2 }, { o: 3, c: 4 }])
    store.setLast({ c: 5 })
    expect(values(store, 'o')).toEqual([1, 3])
    expect(values(store, 'c')).toEqual([2, 5])
    store.clear()
    expect(store.length).toBe(0)
    expect(store.start).toBe(2)
    expect(store.epoch).toBe(1)
    expect(() => store.setLast({ c: 1 })).toThrow(/没有行/)
  })

  it('非法输入立即报错', () => {
    expect(() => createColumnStore({ fields: [] })).toThrow(/至少/)
    expect(() => createColumnStore({ fields: ['a', 'a'] })).toThrow(/重复/)
    expect(() => createColumnStore({ fields: ['a'], capacity: 0 })).toThrow(/capacity/)
    expect(() => createColumnStore({ fields: ['a'], columns: { a: [1], b: [2] } })).toThrow(/没有声明/)
    expect(() => createColumnStore({ fields: ['a', 'b'], columns: { a: [1], b: [2, 3] } })).toThrow(/等长/)
    const store = createColumnStore({ fields: ['a'] })
    expect(() => store.append({ a: 'x' as never })).toThrow(/数与日期/)
    expect(() => store.shift(-1)).toThrow(/非负整数/)
  })

  it('数据仓是冻结对象，能被认出是列式数据；数组不是', () => {
    const store = createColumnStore({ fields: ['a'] })
    expect(Object.isFrozen(store)).toBe(true)
    expect(isColumnSource(store)).toBe(true)
    expect(isColumnSource([{ a: 1 }])).toBe(false)
    expect(isColumnSource(null)).toBe(false)
  })

  it('随机的追加、改写末行、删头与上限：与一份普通数组的模型逐行一致', () => {
    forAll(40, 11, (random) => {
      const capacity = random() < 0.5 ? undefined : integer(random, 1, 40)
      const ops = Array.from({ length: integer(random, 1, 200) }, () => {
        const r = random()
        return r < 0.6 ? { op: 'append' as const, n: integer(random, 1, 5) } : r < 0.8 ? { op: 'set' as const } : r < 0.95 ? { op: 'shift' as const, n: integer(random, 0, 4) } : { op: 'clear' as const }
      })
      return { capacity, ops }
    }, ({ capacity, ops }) => {
      const store = createColumnStore({ fields: ['v'], capacity })
      let model: number[] = []
      let start = 0
      let next = 0
      for (const step of ops) {
        if (step.op === 'append') {
          const rows = Array.from({ length: step.n }, () => ({ v: next++ }))
          store.append(rows)
          model.push(...rows.map(r => r.v))
          if (capacity !== undefined && model.length > capacity) {
            start += model.length - capacity
            model = model.slice(model.length - capacity)
          }
        }
        else if (step.op === 'set' && model.length > 0) {
          store.setLast({ v: -next })
          model[model.length - 1] = -next
        }
        else if (step.op === 'shift') {
          const n = Math.min(step.n, model.length)
          store.shift(step.n)
          start += n
          model = model.slice(n)
        }
        else if (step.op === 'clear') {
          store.clear()
          start += model.length
          model = []
        }
      }
      expect(values(store, 'v')).toEqual(model)
      expect(store.start).toBe(start)
    })
  })
})

describe('有序列二分', () => {
  const column = new Float64Array([1, 2, 2, 2, 5, 8])

  it('左右边界与最近下标', () => {
    expect(bisectLeft(column, 2)).toBe(1)
    expect(bisectRight(column, 2)).toBe(4)
    expect(bisectLeft(column, 0)).toBe(0)
    expect(bisectLeft(column, 9)).toBe(6)
    expect(nearestIndex(column, 6)).toBe(4)
    expect(nearestIndex(column, 7)).toBe(5)
    expect(nearestIndex(column, 6.5)).toBe(4)
    expect(nearestIndex(column, -3)).toBe(0)
    expect(nearestIndex(column, 100, 2, 4)).toBe(3)
    expect(nearestIndex(column, 1, 3, 3)).toBe(-1)
  })

  it('是否升序：相等算不减，NaN 算不是', () => {
    expect(isAscending(column)).toBe(true)
    expect(isAscending(new Float64Array([1, 3, 2]))).toBe(false)
    expect(isAscending(new Float64Array([1, 3, 2]), 0, 2)).toBe(true)
    expect(isAscending(new Float64Array([1, Number.NaN, 2]))).toBe(false)
  })
})

describe('分块极值', () => {
  /** 暴力扫一遍 [from, to) 的最小与最大。 */
  function brute(lo: ArrayLike<number>, hi: ArrayLike<number>, from: number, to: number): { min: number, max: number } | null {
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY
    for (let i = from; i < to; i++) {
      if ((lo[i] as number) < min)
        min = lo[i] as number
      if ((hi[i] as number) > max)
        max = hi[i] as number
    }
    return min === Number.POSITIVE_INFINITY && max === Number.NEGATIVE_INFINITY ? null : { min, max }
  }

  it('任意区间与暴力扫描一致，极值的下标指向那个值（含缺失、跨块与零头）', () => {
    const random = seeded(7)
    const n = EXTENT_BLOCK * 5 + 37
    const lo = Array.from({ length: n }, () => (random() < 0.05 ? Number.NaN : random() * 100))
    const hi = lo.map(v => (Number.isNaN(v) ? v : v + random() * 10))
    const store = createColumnStore({ fields: ['lo', 'hi'], columns: { lo, hi } })
    const index = createExtentIndex(store, 'lo', 'hi')
    forAll(200, 3, r => [integer(r, 0, n), integer(r, 0, n)] as const, ([a, b]) => {
      const from = Math.min(a, b)
      const to = Math.max(a, b)
      const got = index.extent(from, to)
      const want = brute(lo, hi, from, to)
      if (!want) {
        expect(got).toBeNull()
        return
      }
      expect(got!.min).toBe(want.min)
      expect(got!.max).toBe(want.max)
      expect(lo[got!.minAt]).toBe(want.min)
      expect(hi[got!.maxAt]).toBe(want.max)
    })
  })

  it('流式：追加、改写末行与滑出窗口后仍与暴力扫描一致', () => {
    const store = createColumnStore({ fields: ['v'], capacity: EXTENT_BLOCK * 3 })
    const index = createExtentIndex(store, 'v')
    const random = seeded(19)
    for (let round = 0; round < 60; round++) {
      store.append(Array.from({ length: integer(random, 1, 400) }, () => ({ v: random() * 1000 - 500 })))
      if (random() < 0.5)
        store.setLast({ v: random() * 5000 - 2500 })
      const v = store.column('v')!
      const got = index.extent(0, store.length)
      const want = brute(v, v, 0, store.length)!
      expect(got!.min).toBe(want.min)
      expect(got!.max).toBe(want.max)
    }
  })

  it('清空之后缓存作废：新数据的极值不受旧块影响', () => {
    const store = createColumnStore({ fields: ['v'] })
    store.appendColumns({ v: Array.from({ length: EXTENT_BLOCK * 3 }, (_, i) => i) })
    const index = createExtentIndex(store, 'v')
    expect(index.extent(0, store.length)!.max).toBe(EXTENT_BLOCK * 3 - 1)
    store.clear()
    store.appendColumns({ v: Array.from({ length: EXTENT_BLOCK * 3 }, (_, i) => -1 - i) })
    expect(index.extent(0, store.length)!.max).toBe(-1)
    expect(index.extent(5, 5)).toBeNull()
  })

  it('字段没有声明时报错', () => {
    const store = createColumnStore({ fields: ['v'] })
    expect(() => createExtentIndex(store, 'w')).toThrow(/没有声明/)
  })
})

describe('按像素列降采样（M4）', () => {
  /** 每个像素列里首、末、最小、最大都应在输出里。 */
  function columnsOf(x: ArrayLike<number>, y: ArrayLike<number>, pixel: (v: number) => number): Map<number, number[]> {
    const out = new Map<number, number[]>()
    for (let i = 0; i < y.length; i++) {
      if (Number.isNaN(y[i] as number))
        continue
      const c = Math.floor(pixel(x[i] as number))
      out.set(c, [...(out.get(c) ?? []), i])
    }
    return out
  }

  it('每个像素列的首、末、最小、最大都保留，输出按原次序、不重复', () => {
    forAll(30, 5, (random) => {
      const n = integer(random, 1, 3000)
      const x = Array.from({ length: n }, (_, i) => i * 0.37)
      const y = Array.from({ length: n }, () => random() * 100)
      const width = integer(random, 1, 300)
      return { x, y, width }
    }, ({ x, y, width }) => {
      const k = width / Math.max(1, x.at(-1)!)
      const pixel = (v: number): number => v * k
      const { indices, count } = decimateLine(x, y, 0, x.length, pixel)
      const kept = [...indices.subarray(0, count)]
      expect(kept).toEqual([...kept].sort((a, b) => a - b))
      expect(new Set(kept).size).toBe(kept.length)
      for (const members of columnsOf(x, y, pixel).values()) {
        const vs = members.map(i => y[i]!)
        const min = members[vs.indexOf(Math.min(...vs))]!
        const max = members[vs.indexOf(Math.max(...vs))]!
        for (const i of [members[0]!, members.at(-1)!, min, max])
          expect(kept).toContain(i)
      }
      expect(count).toBeLessThanOrEqual(Math.min(x.length, (width + 1) * 4))
    })
  })

  it('孤立的尖峰不丢；点稀时原样全留', () => {
    const y = Array.from<number>({ length: 100_000 }).fill(0)
    y[54_321] = 999
    const { indices, count } = decimateLine(null, y, 0, y.length, i => i / 100)
    expect([...indices.subarray(0, count)]).toContain(54_321)
    const sparse = decimateLine(null, [1, 2, 3], 0, 3, i => i * 10)
    expect([...sparse.indices.subarray(0, sparse.count)]).toEqual([0, 1, 2])
  })

  it('缺失值断开：断点只写一个、不在首尾；skip 时两边连起来', () => {
    const y = [Number.NaN, 1, 2, Number.NaN, Number.NaN, 3, 4, Number.NaN]
    const broken = decimateLine(null, y, 0, y.length, i => i * 10)
    expect([...broken.indices.subarray(0, broken.count)]).toEqual([1, 2, -1, 5, 6])
    const joined = decimateLine(null, y, 0, y.length, i => i * 10, { gaps: 'skip' })
    expect([...joined.indices.subarray(0, joined.count)]).toEqual([1, 2, 5, 6])
  })

  it('第二列（区间带）的最小与最大同样保留', () => {
    const lo = [5, 1, 4, 4]
    const hi = [6, 7, 9, 5]
    const { indices, count } = decimateLine(null, hi, 0, 4, () => 0, { y2: lo })
    expect([...indices.subarray(0, count)]).toEqual([0, 1, 2, 3])
  })

  it('复用输出缓冲，放不下时换新的', () => {
    const out = new Int32Array(2)
    const result = decimateLine(null, [1, 2, 3, 4], 0, 4, i => i * 10, { out })
    expect(result.count).toBe(4)
    expect(result.indices).not.toBe(out)
  })
})

describe('合并', () => {
  it('组大小是 2 的幂，使每组至少 minStep 像素', () => {
    expect(bucketSize(100, 1000, 3)).toBe(1)
    expect(bucketSize(1000, 1000, 3)).toBe(4)
    expect(bucketSize(1_000_000, 1000, 3)).toBe(4096)
    expect(bucketSize(0, 1000, 3)).toBe(1)
  })

  it('合并 K 线：开取首、收取末、高取最高、低取最低；组边界按序号对齐，平移时组的成员不变', () => {
    const open = [1, 2, 3, 4, 5, 6]
    const close = [2, 3, 4, 5, 6, 7]
    const high = [3, 9, 5, 6, 7, 8]
    const low = [0, 1, 2, -1, 4, 5]
    const merged = bucketOhlc(open, high, low, close, 0, 6, 4, 2)
    // 序号 2–3 一组、4–7 一组
    expect(merged.count).toBe(2)
    expect([...merged.first.subarray(0, 2)]).toEqual([0, 2])
    expect([...merged.last.subarray(0, 2)]).toEqual([1, 5])
    expect([...merged.open.subarray(0, 2)]).toEqual([1, 3])
    expect([...merged.close.subarray(0, 2)]).toEqual([3, 7])
    expect([...merged.high.subarray(0, 2)]).toEqual([9, 8])
    expect([...merged.low.subarray(0, 2)]).toEqual([0, -1])
    // 同一段数据从 1 起看：第二组不变
    const shifted = bucketOhlc(open, high, low, close, 1, 6, 4, 2)
    expect(shifted.first[1]).toBe(2)
    expect(shifted.high[1]).toBe(8)
  })

  it('柱：每组取绝对值最大的一根，缺失跳过', () => {
    const merged = bucketPeak([1, -9, 3, Number.NaN, 2, 8], 0, 6, 2)
    expect([...merged.value.subarray(0, merged.count)]).toEqual([-9, 3, 8])
    expect([...merged.peak.subarray(0, merged.count)]).toEqual([1, 2, 5])
    expect(() => bucketPeak([1], 0, 1, 0)).toThrow(/组大小/)
  })
})

describe('散点稀疏', () => {
  it('每格只留数据次序最靠后的那个点，输出按数据次序，落在矩形外的点不要', () => {
    const x = [0.1, 0.9, 1.5, 3.2, 50]
    const y = [0.2, 0.3, 0.1, 3.1, 1]
    const rect = { x: 0, y: 0, width: 10, height: 10 }
    const thinned = thinPoints(x, y, 0, 5, v => v, v => v, rect, { cell: 2 })
    // 前三个点在同一格：留最后一个；(3.2, 3.1) 另一格；x = 50 在矩形外
    expect([...thinned.indices.subarray(0, thinned.count)]).toEqual([2, 3])
    expect([...thinned.xs.subarray(0, thinned.count)].map(v => Math.round(v * 10) / 10)).toEqual([1.5, 3.2])
  })

  it('百万个点稀疏到不超过格数', () => {
    const random = seeded(3)
    const n = 1_000_000
    const x = new Float64Array(n)
    const y = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      x[i] = random() * 1000
      y[i] = random() * 400
    }
    const thinned = thinPoints(x, y, 0, n, v => v, v => v, { x: 0, y: 0, width: 1000, height: 400 }, { cell: 2 })
    expect(thinned.count).toBeLessThanOrEqual(501 * 201)
    expect(thinned.count).toBeGreaterThan(80_000)
  })
})

describe('像素网格拾取', () => {
  it('与暴力找最近点一致；超出半径为 −1', () => {
    const random = seeded(23)
    const n = 2000
    const xs = new Float32Array(n)
    const ys = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      xs[i] = random() * 800
      ys[i] = random() * 400
    }
    const index = createPointIndex(xs, ys, n, 12)
    forAll(300, 9, r => [r() * 820 - 10, r() * 420 - 10] as const, ([px, py]) => {
      let best = -1
      let bestDistance = 12 * 12
      for (let i = 0; i < n; i++) {
        const d = (xs[i]! - px) ** 2 + (ys[i]! - py) ** 2
        if (d < bestDistance || (d === bestDistance && i > best)) {
          best = i
          bestDistance = d
        }
      }
      expect(index.nearest(px, py, 12)).toBe(best)
    })
  })

  it('没有点时恒为 −1', () => {
    expect(createPointIndex(new Float32Array(0), new Float32Array(0), 0, 12).nearest(0, 0, 12)).toBe(-1)
  })
})

describe('等距时间刻度', () => {
  const HOUR = 3_600_000
  /** 工作日 9–15 点每 5 分钟一根，跨三个星期（周末没有数据）。 */
  function sessions(): number[] {
    const out: number[] = []
    const base = Date.UTC(2026, 0, 5)
    for (let day = 0; day < 21; day++) {
      const weekday = new Date(base + day * 24 * HOUR).getUTCDay()
      if (weekday === 0 || weekday === 6)
        continue
      for (let m = 9 * 60; m < 15 * 60; m += 5)
        out.push(base + day * 24 * HOUR + m * 60_000)
    }
    return out
  }

  it('刻度落在跨过时间边界之后的第一根，数量不超过预算', () => {
    const times = sessions()
    const ticks = ordinalTimeTicks(times, 0, times.length, 8, utcIntervals)
    expect(ticks.positions.length).toBeGreaterThan(0)
    expect(ticks.positions.length).toBeLessThanOrEqual(8)
    for (const p of ticks.positions) {
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThan(times.length)
    }
    // 按天及更粗的粒度取刻度：每个刻度都是某天的第一根（9 点）
    expect(['day', 'week', 'month']).toContain(ticks.name)
    for (const p of ticks.positions)
      expect(new Date(times[p]!).getUTCHours()).toBe(9)
  })

  it('一天之内按小时取；区间里不跨边界时落一个刻度在起点', () => {
    const times = sessions().slice(0, 72)
    const ticks = ordinalTimeTicks(times, 0, times.length, 8, utcIntervals)
    expect(ticks.name).toBe('hour')
    const within = [times[0]!, times[0]! + 60_000]
    expect(ordinalTimeTicks(within, 0, 2, 5, utcIntervals).positions.length).toBeGreaterThan(0)
    expect(ordinalTimeTicks(times, 3, 3, 5, utcIntervals).positions).toEqual([])
    expect(() => ordinalTimeTicks(times, 0, 3, 0, utcIntervals)).toThrow(/至少/)
  })
})
