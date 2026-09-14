import type { VirtualizerMeasurement, VirtualizerMetrics } from '../src/virtualizer'
import { describe, expect, it } from 'vitest'
import {
  expandVirtualizerRange,
  findVirtualizerRange,
  measureVirtualizerItems,
  normalizeVirtualizerMetrics,
  resolveVirtualizerCount,
  virtualizerOffsetForItem,
  virtualizerTotalSize,
} from '../src/virtualizer'

/**
 * 几何层的判据全部按"虚拟滚动必须保证什么"写，不照着实现的分支写：
 * 位置单调、区间盖住所有露脸的条目、脏数据不外溢、增量与全量同解。
 */

const NO_SIZES = new Map<string | number, number>()

function metrics(overrides: Partial<VirtualizerMetrics> = {}): VirtualizerMetrics {
  return {
    count: 100,
    estimateSize: () => 30,
    gap: 0,
    paddingStart: 0,
    paddingEnd: 0,
    scrollMargin: 0,
    lanes: 1,
    ...overrides,
  }
}

/** 定种伪随机，同一个种子每次跑出同一串，失败可复现。 */
function seeded(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

/** 穷举法：与视口有交集的条目下标，用来对照区间算得全不全。 */
function intersecting(
  items: readonly VirtualizerMeasurement[],
  scrollOffset: number,
  viewportSize: number,
): number[] {
  const limit = scrollOffset + viewportSize
  return items.filter(item => item.end > scrollOffset && item.start < limit).map(item => item.index)
}

describe('位置排布', () => {
  it('单列：每条紧跟上一条，中间隔一个 gap', () => {
    const items = measureVirtualizerItems(metrics({ count: 5, gap: 10 }), NO_SIZES)
    expect(items.map(item => item.start)).toEqual([0, 40, 80, 120, 160])
    expect(items.every(item => item.end === item.start + item.size)).toBe(true)
  })

  it('首条贴着 paddingStart + scrollMargin，gap 不算在它前面', () => {
    const items = measureVirtualizerItems(metrics({ count: 3, gap: 10, paddingStart: 16, scrollMargin: 200 }), NO_SIZES)
    expect(items[0]!.start).toBe(216)
    expect(items[1]!.start).toBe(256)
  })

  it('实测尺寸优先于估算值，按条目身份记账', () => {
    const items = measureVirtualizerItems(
      metrics({ count: 4, getItemKey: index => `row-${index}` }),
      new Map<string | number, number>([['row-1', 100]]),
    )
    expect(items[1]!.size).toBe(100)
    expect(items[2]!.start).toBe(130)
  })

  it('start 随下标单调不减：二分查找成立的前提，多列与不等高也要成立', () => {
    const random = seeded(7)
    for (const lanes of [1, 2, 3, 5]) {
      const items = measureVirtualizerItems(
        metrics({ count: 400, lanes, gap: 4, estimateSize: () => 1 + Math.floor(random() * 120) }),
        NO_SIZES,
      )
      for (let i = 1; i < items.length; i++)
        expect(items[i]!.start).toBeGreaterThanOrEqual(items[i - 1]!.start)
    }
  })
})

describe('多列分道', () => {
  it('首行按道序铺开，之后每条落到当前最短的那道', () => {
    const items = measureVirtualizerItems(
      metrics({ count: 6, lanes: 3, estimateSize: index => (index === 1 ? 100 : 10) }),
      NO_SIZES,
    )
    expect(items.slice(0, 3).map(item => item.lane)).toEqual([0, 1, 2])
    // 第 1 条把 1 道撑到 100，接下来两条都该躲开它
    expect(items[3]!.lane).toBe(0)
    expect(items[4]!.lane).toBe(2)
    expect(items[5]!.lane).toBe(0)
  })

  it('道数比条数多时，多出来的道空着，不影响已排的条目', () => {
    const items = measureVirtualizerItems(metrics({ count: 2, lanes: 5 }), NO_SIZES)
    expect(items.map(item => item.lane)).toEqual([0, 1])
    expect(items.every(item => item.start === 0)).toBe(true)
  })
})

describe('增量重排', () => {
  it('给了 from 就复用前缀，只重算后面那截', () => {
    const m = metrics({ count: 1000 })
    const first = measureVirtualizerItems(m, NO_SIZES)
    const sizes = new Map<string | number, number>([[500, 90]])
    const second = measureVirtualizerItems(m, sizes, first, 500)

    expect(second[499]).toBe(first[499])
    expect(second[500]).not.toBe(first[500])
    expect(second[500]!.size).toBe(90)
    expect(second[501]!.start).toBe(second[500]!.end)
  })

  it('增量与全量同解：多列时分道种子要从复用段还原出来', () => {
    const random = seeded(11)
    const sizeOf = new Map<number, number>()
    for (let i = 0; i < 300; i++) sizeOf.set(i, 1 + Math.floor(random() * 90))
    const m = metrics({ count: 300, lanes: 3, gap: 6, estimateSize: index => sizeOf.get(index)! })

    const full = measureVirtualizerItems(m, NO_SIZES)
    const incremental = measureVirtualizerItems(m, NO_SIZES, measureVirtualizerItems(m, NO_SIZES), 137)
    expect(incremental).toEqual(full)
  })

  it('count 收缩时数组跟着截断，不留越界下标', () => {
    const long = measureVirtualizerItems(metrics({ count: 50 }), NO_SIZES)
    const short = measureVirtualizerItems(metrics({ count: 5 }), NO_SIZES, long, 5)
    expect(short).toHaveLength(5)
    expect(short.at(-1)!.index).toBe(4)
  })

  it('from 超出前缀长度时按前缀长度收，不在数组里凿洞', () => {
    const m = metrics({ count: 20 })
    const previous = measureVirtualizerItems(metrics({ count: 5 }), NO_SIZES)
    const next = measureVirtualizerItems(m, NO_SIZES, previous, 999)
    expect(next).toHaveLength(20)
    expect(next.map(item => item.index)).toEqual(next.map((_, i) => i))
    expect(next[5]!.start).toBe(150)
  })
})

describe('脏数据不外溢', () => {
  it('估算尺寸给出非有限值或负数时按 0 算，不污染后面每一条', () => {
    const poison = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -50]
    for (const bad of poison) {
      const items = measureVirtualizerItems(
        metrics({ count: 4, estimateSize: index => (index === 1 ? bad : 30) }),
        NO_SIZES,
      )
      expect(items.every(item => Number.isFinite(item.start) && Number.isFinite(item.end))).toBe(true)
      expect(items[1]!.size).toBe(0)
      expect(items[2]!.start).toBe(30)
      expect(items[3]!.start).toBe(60)
    }
  })

  it('实测尺寸账本里的脏值同样按 0 算', () => {
    const items = measureVirtualizerItems(metrics({ count: 3 }), new Map<string | number, number>([[0, Number.NaN]]))
    expect(items[0]!.size).toBe(0)
    expect(items[1]!.start).toBe(0)
  })

  it('长度参数收成非负有限值', () => {
    const dirty = normalizeVirtualizerMetrics(metrics({
      gap: Number.NaN,
      paddingStart: Number.POSITIVE_INFINITY,
      paddingEnd: -8,
      scrollMargin: Number.NaN,
      lanes: 0,
      count: -3,
    }))
    expect(dirty).toMatchObject({ gap: 0, paddingStart: 0, paddingEnd: 0, scrollMargin: 0, lanes: 1, count: 0 })
  })

  it('总条数取整且不为负', () => {
    expect(resolveVirtualizerCount(3.9)).toBe(3)
    expect(resolveVirtualizerCount(-1)).toBe(0)
    expect(resolveVirtualizerCount(Number.NaN)).toBe(0)
    expect(resolveVirtualizerCount(undefined)).toBe(0)
  })

  it('滚动量是非有限值时按 0 当，不返回空区间', () => {
    const items = measureVirtualizerItems(metrics({ count: 100 }), NO_SIZES)
    expect(findVirtualizerRange(items, Number.NaN, 100, 1)).toEqual({ startIndex: 0, endIndex: 3 })
  })
})

describe('可视区间', () => {
  it('视口量不到尺寸时一条都不渲', () => {
    const items = measureVirtualizerItems(metrics(), NO_SIZES)
    expect(findVirtualizerRange(items, 0, 0, 1)).toBe(null)
    expect(findVirtualizerRange(items, 0, Number.NaN, 1)).toBe(null)
    expect(findVirtualizerRange(items, 0, -100, 1)).toBe(null)
  })

  it('一条都没有时返回 null', () => {
    expect(findVirtualizerRange([], 0, 100, 1)).toBe(null)
  })

  it('条数不多于道数时整份渲出来', () => {
    const items = measureVirtualizerItems(metrics({ count: 3, lanes: 3 }), NO_SIZES)
    expect(findVirtualizerRange(items, 0, 100, 3)).toEqual({ startIndex: 0, endIndex: 2 })
  })

  it('区间盖住每一条与视口有交集的条目：随机尺寸、随机滚动量逐点对照', () => {
    const random = seeded(2026)
    for (const lanes of [1, 2, 4]) {
      const sizeOf = new Map<number, number>()
      for (let i = 0; i < 500; i++) sizeOf.set(i, 1 + Math.floor(random() * 150))
      const m = metrics({ count: 500, lanes, gap: 5, estimateSize: index => sizeOf.get(index)! })
      const items = measureVirtualizerItems(m, NO_SIZES)
      const total = virtualizerTotalSize(items, m)

      for (let probe = 0; probe < 60; probe++) {
        const offset = Math.floor(random() * total)
        const viewport = 50 + Math.floor(random() * 400)
        const range = findVirtualizerRange(items, offset, viewport, lanes)
        const expected = intersecting(items, offset, viewport)
        if (expected.length === 0)
          continue
        expect(range).not.toBe(null)
        expect(range!.startIndex).toBeLessThanOrEqual(Math.min(...expected))
        expect(range!.endIndex).toBeGreaterThanOrEqual(Math.max(...expected))
      }
    }
  })

  it('过扫描往两头各撑几条，并夹在 [0, count - 1] 内', () => {
    expect(expandVirtualizerRange({ startIndex: 10, endIndex: 13 }, 5, 1000)).toEqual({ from: 5, to: 18 })
    expect(expandVirtualizerRange({ startIndex: 0, endIndex: 3 }, 5, 1000)).toEqual({ from: 0, to: 8 })
    expect(expandVirtualizerRange({ startIndex: 995, endIndex: 999 }, 5, 1000)).toEqual({ from: 990, to: 999 })
    expect(expandVirtualizerRange({ startIndex: 0, endIndex: 0 }, -3, 10)).toEqual({ from: 0, to: 0 })
  })
})

describe('总长', () => {
  it('一条都没有时只剩前后内边距', () => {
    expect(virtualizerTotalSize([], metrics({ count: 0, paddingStart: 16, paddingEnd: 24 }))).toBe(40)
  })

  it('单列取末条末缘，折算掉 scrollMargin 再加尾内边距', () => {
    const m = metrics({ count: 10, paddingStart: 16, paddingEnd: 24, scrollMargin: 200 })
    expect(virtualizerTotalSize(measureVirtualizerItems(m, NO_SIZES), m)).toBe(16 + 300 + 24)
  })

  it('多列取最长那道，不是最后一条', () => {
    const m = metrics({ count: 4, lanes: 2, estimateSize: index => (index === 0 ? 500 : 10) })
    // 0 道被首条撑到 500，1 道上摞了三条共 30
    expect(virtualizerTotalSize(measureVirtualizerItems(m, NO_SIZES), m)).toBe(500)
  })

  it('scrollMargin 是列表上方别人的那截，再长也不计进本列表的长度', () => {
    const m = metrics({ count: 1, estimateSize: () => 10, scrollMargin: 5000 })
    expect(virtualizerTotalSize(measureVirtualizerItems(m, NO_SIZES), m)).toBe(10)
  })

  it('空列表配上再大的 scrollMargin 也不给出负长度', () => {
    expect(virtualizerTotalSize([], metrics({ count: 0, scrollMargin: 5000 }))).toBe(0)
  })
})

describe('滚到某一条', () => {
  const item: VirtualizerMeasurement = { index: 10, key: 10, start: 300, end: 330, size: 30, lane: 0 }

  it('start 贴起始缘、end 贴结束缘、center 居中', () => {
    expect(virtualizerOffsetForItem(item, 'start', 0, 100, 10000)).toBe(300)
    expect(virtualizerOffsetForItem(item, 'end', 0, 100, 10000)).toBe(230)
    expect(virtualizerOffsetForItem(item, 'center', 0, 100, 10000)).toBe(265)
  })

  it('auto：已经整条露着就原地不动', () => {
    expect(virtualizerOffsetForItem(item, 'auto', 290, 100, 10000)).toBe(290)
  })

  it('auto：在视口下方就贴结束缘，在上方就贴起始缘', () => {
    expect(virtualizerOffsetForItem(item, 'auto', 0, 100, 10000)).toBe(230)
    expect(virtualizerOffsetForItem(item, 'auto', 500, 100, 10000)).toBe(300)
  })

  it('结果夹在 [0, 滚动行程上限] 内', () => {
    expect(virtualizerOffsetForItem(item, 'end', 0, 1000, 10000)).toBe(0)
    expect(virtualizerOffsetForItem(item, 'start', 0, 100, 120)).toBe(120)
    expect(virtualizerOffsetForItem(item, 'start', 0, 100, Number.NaN)).toBe(0)
  })
})

// 规模这一节量的是「做了多少功」而不是「跑了多少毫秒」：
// 挂钟读数随机器忙闲浮动，在并行跑测时会随机翻红，量出来的也不是复杂度。
describe('规模', () => {
  /** 整份重排一共问了几次尺寸。每条只算一遍，次数就恒等于条数；重扫一遍即翻倍。 */
  function countSizeQueries(count: number): number {
    let asked = 0
    measureVirtualizerItems(
      metrics({
        count,
        estimateSize: () => {
          asked++
          return 30
        },
      }),
      NO_SIZES,
    )
    return asked
  }

  /** 一次查找读了几次下标。二分只读对数级的次数，与总条数几乎无关。 */
  function countProbes(items: readonly VirtualizerMeasurement[], offset: number): number {
    let reads = 0
    const counted = new Proxy(items as VirtualizerMeasurement[], {
      get(target, key, receiver) {
        if (typeof key === 'string' && Number.isInteger(Number(key)))
          reads++
        return Reflect.get(target, key, receiver)
      },
    })
    findVirtualizerRange(counted, offset, 600, 1)
    return reads
  }

  it('整份重排每条只算一遍：问尺寸的次数恒等于条数', () => {
    expect(countSizeQueries(20_000)).toBe(20_000)
    expect(countSizeQueries(200_000)).toBe(200_000)
  })

  it('找区间与条数无关：条数翻十倍，只多出二分那几层的探测', () => {
    const smallItems = measureVirtualizerItems(metrics({ count: 20_000 }), NO_SIZES)
    const largeItems = measureVirtualizerItems(metrics({ count: 200_000 }), NO_SIZES)
    // 同一滚动位置、同一视口，向前走的步数一样，差额只来自二分多出来的层数（log2(10) ≈ 3.3）
    for (const offset of [0, 1000, 100_000, 500_000])
      expect(countProbes(largeItems, offset) - countProbes(smallItems, offset)).toBeLessThanOrEqual(10)
  })
})
