// 大数据基准：只记录趋势，不作门禁。目标值（桌面参考机）：
// M4 100 万点 → 1000 px ≤ 8 ms；分块极值首次全段 ≤ 8 ms、之后区间查询 ≤ 50 µs；
// K 线 100 万根合并 ≤ 12 ms；散点 100 万点稀疏 ≤ 20 ms；逐行追加 100 万次（容量 10 万）≤ 150 ms。

import { bench, describe } from 'vitest'
import { bucketOhlc, bucketSize, createColumnStore, createExtentIndex, decimateLine, thinPoints } from '../../src/columns'
import { seeded } from '../helpers/property'

const N = 1_000_000
const random = seeded(2026)
const time = new Float64Array(N)
const value = new Float64Array(N)
const open = new Float64Array(N)
const high = new Float64Array(N)
const low = new Float64Array(N)
const close = new Float64Array(N)
let price = 100
for (let i = 0; i < N; i++) {
  time[i] = 1_700_000_000_000 + i * 60_000
  value[i] = Math.sin(i / 5000) * 100 + random() * 10
  open[i] = price
  price += random() - 0.5
  close[i] = price
  high[i] = Math.max(open[i]!, close[i]!) + random()
  low[i] = Math.min(open[i]!, close[i]!) - random()
}
const scatterX = new Float64Array(N).map(() => random() * 1000)
const scatterY = new Float64Array(N).map(() => random() * 400)
const k = 1000 / (time[N - 1]! - time[0]!)
const toPixel = (t: number): number => (t - time[0]!) * k

describe('按像素降采样', () => {
  bench('按像素列：100 万点 → 1000 px（M4）', () => {
    decimateLine(time, value, 0, N, toPixel)
  })
})

describe('分块极值', () => {
  const store = createColumnStore({ fields: ['v'], columns: { v: value } })
  const warm = createExtentIndex(store, 'v')
  warm.extent(0, N)
  bench('首次全段：100 万点', () => {
    createExtentIndex(store, 'v').extent(0, N)
  })
  bench('建好之后的区间查询', () => {
    warm.extent(123_457, 876_543)
  })
})

describe('合并与稀疏', () => {
  const size = bucketSize(N, 1000, 3)
  bench('合并 K 线：100 万根按 2 的幂一组', () => {
    bucketOhlc(open, high, low, close, 0, N, size)
  })
  bench('散点：100 万点按 2px 格稀疏', () => {
    thinPoints(scatterX, scatterY, 0, N, v => v, v => v, { x: 0, y: 0, width: 1000, height: 400 })
  })
})

describe('流式追加', () => {
  bench('逐行追加 100 万次，容量 10 万', () => {
    const store = createColumnStore({ fields: ['t', 'v'], capacity: 100_000 })
    for (let i = 0; i < N; i++)
      store.append({ t: i, v: i })
  }, { iterations: 3 })
})
