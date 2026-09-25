/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 坐标轴布局：只算刻度位置、标签避让与轴带厚度，不碰 DOM；绘图区尺寸与轴厚互相依赖，迭代到稳定。

import type { Rect } from '../geometry'
import type { BandScale, CategoryKey, ContinuousScale, TimeScale } from '../scale/types'
import type { FontSpec, TextMeasurer } from '../text'
import { invalidArgument } from '../errors'
import { ellipsize, wrapText } from '../text'

export type AxisPosition = 'bottom' | 'top' | 'left' | 'right'
/**
 * 类目轴的比例尺：任意键类型的 band / point 都可以（map 的参数写成 never，
 * 使 BandScale<'一月' | '二月'> 这类键更窄的比例尺也能传入）。
 */
export type CategoryAxisScale = Omit<BandScale<CategoryKey>, 'map' | 'index' | 'invert'> & {
  readonly map: (key: never) => number | undefined
}
export type AxisScale = ContinuousScale | TimeScale | CategoryAxisScale
export type LabelOverflow = 'auto' | 'rotate' | 'truncate' | 'wrap'

export interface AxisLayoutInput {
  readonly scale: AxisScale
  readonly position: AxisPosition
  /** 刻度数量提示或显式刻度值；缺省按像素密度推导。类目轴缺省每个类目一个刻度。 */
  readonly ticks?: number | readonly unknown[]
  readonly format: (value: unknown) => string
  readonly measure: TextMeasurer
  readonly font: FontSpec
  /**
   * 横轴标签放不下时：auto 先转 −45°，仍冲突就隔几个显示；rotate 只旋转（−45° 放不下转 −90°）；
   * truncate 截断加「…」；wrap 折成至多两行。刻度线始终全部保留。纵轴标签超宽时截断或折行。
   */
  readonly labelOverflow: LabelOverflow
  /** 相邻标签之间至少留的空隙。 */
  readonly minLabelGap: number
  /** 纵轴标签的最大宽度；横轴旋转后标签的最大长度。 */
  readonly maxLabelSize: number
  /** 刻度线长度。 */
  readonly tickLength: number
  /** 刻度线与标签、标签与标题之间的间距。 */
  readonly labelGap: number
  readonly title?: string
  /** 标题字体，缺省同 font。 */
  readonly titleFont?: FontSpec
}

export interface AxisTick {
  readonly value: unknown
  /** 沿轴方向的像素位置（比例尺值域坐标；类目轴为带中心）。 */
  readonly offset: number
  /** 完整标签，截断时供 `<title>` 与可及名使用。 */
  readonly label: string
  /** 实际显示的行。 */
  readonly lines: readonly string[]
  readonly visible: boolean
  readonly rotate: 0 | -45 | -90
  readonly truncated: boolean
}

export interface AxisLayout {
  readonly ticks: readonly AxisTick[]
  /** 轴线 + 刻度 + 标签 + 标题占的厚度（垂直于轴的方向）。 */
  readonly thickness: number
  /** 网格线位置：与刻度一一对应。 */
  readonly gridOffsets: readonly number[]
}

const SIN45 = Math.SQRT1_2

function isCategory(scale: AxisScale): scale is CategoryAxisScale {
  return scale.kind === 'band' || scale.kind === 'point'
}

function isHorizontal(position: AxisPosition): boolean {
  return position === 'bottom' || position === 'top'
}

function axisLength(scale: AxisScale): number {
  const [a, b] = scale.range as readonly number[]
  return Math.abs((b as number) - (a as number))
}

function offsetOf(scale: AxisScale, value: unknown): number {
  if (isCategory(scale)) {
    const at = (scale.map as (key: CategoryKey) => number | undefined)(value as CategoryKey)
    return at === undefined ? Number.NaN : at + (scale.kind === 'band' ? scale.bandwidth / 2 : 0)
  }
  const at = (scale.map as (v: unknown) => number | undefined)(value)
  return at ?? Number.NaN
}

/** 刻度值：显式给出、类目全量，或按像素密度推导数量——横轴按最宽标签加间隙，纵轴按 2.5 倍行高。 */
function tickValues(input: AxisLayoutInput): readonly unknown[] {
  const { scale, ticks } = input
  if (Array.isArray(ticks))
    return ticks
  if (isCategory(scale))
    return scale.domain
  const continuous = scale as ContinuousScale | TimeScale
  const make = (count: number): unknown[] => (continuous.ticks as (c: number) => unknown[])(count)
  if (typeof ticks === 'number')
    return make(ticks)
  const length = axisLength(scale)
  if (!isHorizontal(input.position))
    return make(Math.max(2, Math.floor(length / (input.font.lineHeight * 2.5))))
  const widthOf = (value: unknown): number => input.measure.measure(input.format(value), input.font).width
  const domain = continuous.domain as readonly unknown[]
  const ends = Math.max(widthOf(domain[0]), widthOf(domain[domain.length - 1]))
  let count = Math.max(2, Math.floor(length / (ends + input.minLabelGap)))
  let values = make(count)
  // 刻度落在取整后的位置上，间距不一定均分：按相邻标签实际需要的间距与实际间距之比收缩刻度数
  for (let round = 0; round < 40 && count > 1; round++) {
    let ratio = 0
    for (let i = 1; i < values.length; i++) {
      const need = (widthOf(values[i]) + widthOf(values[i - 1])) / 2 + input.minLabelGap
      const spacing = Math.abs(offsetOf(scale, values[i]) - offsetOf(scale, values[i - 1]))
      ratio = Math.max(ratio, need / spacing)
    }
    if (ratio <= 1)
      break
    count = Math.max(1, Math.min(count - 1, Math.floor(count / ratio)))
    values = make(count)
  }
  return values
}

/** 最小的 k，使每隔 k 个显示时相邻可见标签互不冲突。 */
function thinning(offsets: readonly number[], need: (i: number, j: number) => number): number {
  const n = offsets.length
  for (let k = 1; k < n; k++) {
    let ok = true
    for (let i = 0; i + k < n; i += k) {
      if (Math.abs((offsets[i + k] as number) - (offsets[i] as number)) < need(i, i + k)) {
        ok = false
        break
      }
    }
    if (ok)
      return k
  }
  return Math.max(1, n)
}

/** 布局一根坐标轴。 */
export function layoutAxis(input: AxisLayoutInput): AxisLayout {
  const { font, measure, minLabelGap: gap, maxLabelSize, tickLength, labelGap, labelOverflow } = input
  for (const [name, value] of Object.entries({ minLabelGap: gap, maxLabelSize, tickLength, labelGap })) {
    if (!(value >= 0) || !Number.isFinite(value))
      throw invalidArgument(`${name} 必须是非负有限数`, { [name]: value })
  }
  const values = tickValues(input)
  const offsets = values.map(v => offsetOf(input.scale, v))
  const labels = values.map(v => input.format(v))
  const widthOf = (text: string): number => measure.measure(text, font).width
  const widths = labels.map(widthOf)
  const lineHeight = font.lineHeight
  const horizontal = isHorizontal(input.position)

  let lines: string[][] = labels.map(label => [label])
  let rotate: 0 | -45 | -90 = 0
  let every = 1

  if (horizontal) {
    const fitsFlat = (i: number, j: number): number => ((widths[i] as number) + (widths[j] as number)) / 2 + gap
    const flat = thinning(offsets, fitsFlat)
    if (flat > 1) {
      const step = isCategory(input.scale) && input.scale.step > 0 ? input.scale.step : minSpacing(offsets)
      const budget = Math.max(0, step - gap)
      if (labelOverflow === 'truncate') {
        lines = labels.map(label => [ellipsize(label, budget, font, measure)])
        const truncatedWidths = lines.map(l => widthOf(l[0] as string))
        every = thinning(offsets, (i, j) => ((truncatedWidths[i] as number) + (truncatedWidths[j] as number)) / 2 + gap)
        if (lines.some(l => l[0] === ''))
          every = Math.max(every, flat)
      }
      else if (labelOverflow === 'wrap') {
        lines = labels.map(label => wrapText(label, budget, font, measure, { maxLines: 2 }))
        const wrappedWidths = lines.map(l => Math.max(0, ...l.map(widthOf)))
        every = thinning(offsets, (i, j) => ((wrappedWidths[i] as number) + (wrappedWidths[j] as number)) / 2 + gap)
      }
      else {
        // 旋转：相邻两条平行的斜标签之间的垂直距离要容得下一行字
        rotate = -45
        every = thinning(offsets, () => (lineHeight + gap) / SIN45)
        if (every > 1 && labelOverflow === 'rotate') {
          rotate = -90
          every = thinning(offsets, () => lineHeight + gap)
        }
        lines = labels.map(label => [ellipsize(label, maxLabelSize, font, measure)])
      }
    }
  }
  else {
    lines = labelOverflow === 'wrap'
      ? labels.map(label => wrapText(label, maxLabelSize, font, measure, { maxLines: 2 }))
      : labels.map(label => [ellipsize(label, maxLabelSize, font, measure)])
    const heights = lines.map(l => l.length * lineHeight)
    every = thinning(offsets, (i, j) => ((heights[i] as number) + (heights[j] as number)) / 2 + gap)
  }

  const ticks: AxisTick[] = values.map((value, i) => {
    const shown = lines[i] as string[]
    return {
      value,
      offset: offsets[i] as number,
      label: labels[i] as string,
      lines: shown,
      visible: i % every === 0 && shown.some(line => line !== ''),
      rotate,
      truncated: shown.join(' ') !== labels[i] && shown.join('') !== labels[i],
    }
  })

  const visible = ticks.filter(t => t.visible)
  let labelExtent = 0
  for (const tick of visible) {
    const w = Math.max(0, ...tick.lines.map(widthOf))
    const h = tick.lines.length * lineHeight
    const extent = !horizontal ? w : rotate === 0 ? h : rotate === -90 ? w : w * SIN45 + lineHeight * SIN45
    labelExtent = Math.max(labelExtent, extent)
  }
  const titleHeight = input.title ? labelGap + (input.titleFont ?? font).lineHeight : 0
  return {
    ticks,
    thickness: tickLength + (visible.length > 0 ? labelGap + labelExtent : 0) + titleHeight,
    gridOffsets: offsets,
  }
}

function minSpacing(offsets: readonly number[]): number {
  let min = Number.POSITIVE_INFINITY
  for (let i = 1; i < offsets.length; i++)
    min = Math.min(min, Math.abs((offsets[i] as number) - (offsets[i - 1] as number)))
  return Number.isFinite(min) ? min : 0
}

export interface PlotRectInput {
  /** 整个图表视口内可用的矩形。 */
  readonly outer: Rect
  /** 各位置上的坐标轴配置（不含比例尺）。 */
  readonly axes: Partial<Record<AxisPosition, Omit<AxisLayoutInput, 'scale' | 'position'>>>
  /** 按绘图区矩形构造各轴的比例尺（值域取自绘图区，方向由调用方决定）。 */
  readonly scales: Partial<Record<AxisPosition, (plot: Rect) => AxisScale>>
}

export interface PlotRectResult {
  readonly plot: Rect
  readonly axes: Partial<Record<AxisPosition, AxisLayout>>
  readonly scales: Partial<Record<AxisPosition, AxisScale>>
}

const POSITIONS: readonly AxisPosition[] = ['top', 'right', 'bottom', 'left']

/**
 * 绘图区求解：纵轴标签宽度取决于纵轴刻度，纵轴刻度取决于绘图区高度，高度又取决于横轴厚度。
 * 从零厚度出发，按上一轮的轴厚求绘图区、再布局各轴，直到厚度不再变化（至多 3 轮）。
 */
export function solvePlotRect(input: PlotRectInput): PlotRectResult {
  const { outer } = input
  const thickness: Record<AxisPosition, number> = { top: 0, right: 0, bottom: 0, left: 0 }
  for (const position of POSITIONS) {
    if (input.axes[position] && !input.scales[position])
      throw invalidArgument('坐标轴缺少比例尺', { position })
  }
  const plotOf = (): Rect => ({
    x: outer.x + thickness.left,
    y: outer.y + thickness.top,
    width: Math.max(0, outer.width - thickness.left - thickness.right),
    height: Math.max(0, outer.height - thickness.top - thickness.bottom),
  })

  let result: PlotRectResult = { plot: plotOf(), axes: {}, scales: {} }
  for (let round = 0; round < 3; round++) {
    const plot = plotOf()
    const axes: Partial<Record<AxisPosition, AxisLayout>> = {}
    const scales: Partial<Record<AxisPosition, AxisScale>> = {}
    let stable = true
    for (const position of POSITIONS) {
      const config = input.axes[position]
      const factory = input.scales[position]
      if (!config || !factory)
        continue
      const scale = factory(plot)
      const layout = layoutAxis({ ...config, scale, position })
      scales[position] = scale
      axes[position] = layout
      if (Math.abs(layout.thickness - thickness[position]) > 0.5)
        stable = false
    }
    result = { plot, axes, scales }
    if (stable)
      break
    for (const position of POSITIONS) {
      const layout = axes[position]
      if (layout)
        thickness[position] = layout.thickness
    }
  }
  return result
}
