// 引擎基准：只记录趋势，不作门禁。目标值（桌面参考机）：stack 10 个系列 × 1 万点 < 5 ms，LTTB 10 万点降到 1 千点 < 8 ms。

import { bench, describe } from 'vitest'
import { createEstimatingMeasurer, layoutAxis, line, lttb, minMax, scaleBand, scaleLinear, stack } from '../../src'
import { seeded } from '../helpers/property'

const random = seeded(2026)
const keys = Array.from({ length: 10 }, (_, i) => `s${i}`)
const rows = Array.from({ length: 10_000 }, () => Object.fromEntries(keys.map(k => [k, random() * 100])))
const series = Array.from({ length: 100_000 }, (_, i): [number, number] => [i, Math.sin(i / 500) * 100 + random() * 10])

describe('堆叠', () => {
  bench('10 个系列 × 1 万点', () => {
    stack(rows, { keys, value: (row, key) => row[key] as number })
  })
})

describe('降采样', () => {
  bench('最大三角形三桶：10 万点降到 1 千点', () => {
    lttb(series, 1000, p => p[0], p => p[1])
  })
  bench('min-max：10 万点分 500 桶', () => {
    minMax(series, 500, p => p[0], p => p[1])
  })
})

describe('路径与坐标轴', () => {
  const x = scaleLinear({ domain: [0, 100_000], range: [0, 1000] })
  const y = scaleLinear({ domain: [-110, 110], range: [400, 0] })
  const sampled = lttb(series, 2000, p => p[0], p => p[1])
  bench('折线：2 千点生成路径', () => {
    line<[number, number]>({ x: p => x.map(p[0]) as number, y: p => y.map(p[1]) as number })(sampled)
  })
  const measure = createEstimatingMeasurer()
  const font = { family: 'sans-serif', size: 12, weight: 400, lineHeight: 16 }
  const categories = Array.from({ length: 200 }, (_, i) => `类目 ${i}`)
  bench('类目轴：200 个类目的标签避让', () => {
    layoutAxis({
      scale: scaleBand({ domain: categories, range: [0, 1000] }),
      position: 'bottom',
      format: String,
      measure,
      font,
      labelOverflow: 'auto',
      minLabelGap: 8,
      maxLabelSize: 80,
      tickLength: 4,
      labelGap: 4,
    })
  })
})
