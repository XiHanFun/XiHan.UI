/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 样式探针：画布模式下系列分组里放的空几何标记，与画布要画的数据标记同部件、同状态属性。
// 画布读它们的计算样式作画，颜色、线宽、纹理与淡出都来自同一份 CSS；它们不进可访问树、不可聚焦。

import type { Mark } from '@xihan-ui/viz'

/** 样式探针要对上的那几个属性：部件、涨跌、画法（K 线的实体与美国线、箱与小提琴）、是否按值着色。 */
export interface CartesianProbeDescriptor {
  readonly part: string
  readonly trend: 'rise' | 'fall' | null
  readonly style: 'candle' | 'ohlc' | 'box' | 'violin' | null
  /** 按值着色的点：颜色由三个锚点探针按色阶插值。 */
  readonly sequential: boolean
}

/** 一个数据标记对应哪一个样式探针。 */
export function cartesianProbeDescriptor(mark: Mark): CartesianProbeDescriptor {
  return {
    part: mark.part,
    trend: mark.part === 'bar' || mark.part === 'candle' || mark.part === 'wick' ? mark.paint?.trend ?? null : null,
    style: mark.part === 'candle' ? (mark.kind === 'rect' ? 'candle' : 'ohlc') : mark.part === 'box' ? (mark.kind === 'rect' ? 'box' : 'violin') : null,
    sequential: mark.part === 'point' && mark.paint?.t != null,
  }
}

/** 按值着色的锚点探针的色阶位置：起点、中点、终点。 */
export const CARTESIAN_SEQUENTIAL_ANCHORS = [0, 0.5, 1] as const

const probes = new WeakSet<Mark>()

/** 这个标记是不是样式探针。 */
export function isCartesianProbe(mark: Mark): boolean {
  return probes.has(mark)
}

/** 与模板同种类、同部件、同着色引用的空几何标记；t 给了时换成按值着色的那个位置。 */
export function cartesianProbe(template: Mark, key: string, t?: number): Mark {
  const paint = t === undefined ? template.paint : { ...template.paint, t }
  const base = { key, part: template.part, ...(paint ? { paint } : {}) }
  let probe: Mark
  switch (template.kind) {
    case 'rect':
      probe = { ...base, kind: 'rect', x: 0, y: 0, width: 0, height: 0 }
      break
    case 'line':
      probe = { ...base, kind: 'line', points: [], curve: 'linear' }
      break
    case 'area':
      probe = { ...base, kind: 'area', points: [], curve: 'linear' }
      break
    case 'symbol':
      probe = { ...base, kind: 'symbol', x: 0, y: 0, size: 0, symbol: template.symbol }
      break
    default:
      probe = { ...base, kind: 'path', d: '' }
  }
  probes.add(probe)
  return probe
}

/** 一组模板标记的样式探针：每种（部件、涨跌、画法）各一个，按值着色的点另加三个锚点。key 以 prefix 开头。 */
export function cartesianProbesOf(templates: readonly Mark[], prefix: string): Mark[] {
  const seen = new Set<string>()
  const out: Mark[] = []
  for (const mark of templates) {
    const d = cartesianProbeDescriptor(mark)
    const id = `${d.part}:${d.trend ?? ''}:${d.style ?? ''}:${d.sequential ? 'seq' : ''}`
    if (seen.has(id))
      continue
    seen.add(id)
    if (d.sequential) {
      CARTESIAN_SEQUENTIAL_ANCHORS.forEach((t, i) => out.push(cartesianProbe(mark, `${prefix}:probe:${id}:${i}`, t)))
      continue
    }
    out.push(cartesianProbe(mark, `${prefix}:probe:${id}`))
  }
  return out
}
