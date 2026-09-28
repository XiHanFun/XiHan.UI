/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 直角坐标图的画布数据层：场景的数据层原样画上去，几何与 SVG 同一份（markPath 写进 Canvas 2D 上下文），
// 颜色、线宽、虚线、纹理与淡出一律读系列分组里同部件的样式探针。相同画法的相邻标记合成一条路径一次填、一次描；
// 点逐个贴精灵图，按数据次序叠放。刷选时框外的标记按淡出的不透明度画。

import type { EffectParams } from '@xihan-ui/core'
import type { Mark, PathMark, ShapeMark, SymbolMark } from '@xihan-ui/viz'
import type { ChartCanvasFrame, ChartPaint } from '../shared/chart'
import type { CartesianProbeDescriptor } from './cartesian-chart.logic'
import type { CartesianChartSchema } from './cartesian-chart.schema'
import { markPath } from '@xihan-ui/viz'
import { createColorRamp, formatCssColor } from '@xihan-ui/viz/canvas'
import {
  cartesianBrushedRefs,
  cartesianBrushingSelection,
  cartesianIsEmpty,
  cartesianModelOf,
  cartesianProbeDescriptor,
} from './cartesian-chart.logic'

/** 刷选时要按框里框外淡出的数据标记，与 SVG 皮肤里带 data-dimmed 的那几种一致。 */
const BRUSHED_PARTS = new Set(['bar', 'point', 'candle', 'wick', 'box', 'whisker', 'median', 'outlier', 'stem'])

/** 符号类标记：逐个贴精灵图。 */
function isSymbol(mark: Mark): mark is SymbolMark {
  return mark.kind === 'symbol'
}

function escapeValue(value: string): string {
  return typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(value) : value.replace(/["\\]/g, '\\$&')
}

/** 探针的选择器：部件、涨跌、画法都对上；不带涨跌的标记找不带 data-trend 的探针。 */
function probeSelector(d: CartesianProbeDescriptor): string {
  return `:scope > [data-part="${d.part}"]${d.trend ? `[data-trend="${d.trend}"]` : ':not([data-trend])'}${d.style ? `[data-style="${d.style}"]` : ''}${d.sequential ? '[data-seg]' : ':not([data-seg])'}`
}

/** 一个标记的路径写进一条 Path2D：带几何参数的路径按参数重写，只有 d 的按 d 并进来，其余交给 markPath。 */
function trace(target: Path2D, mark: Mark): void {
  if (mark.kind === 'path') {
    const path = mark as PathMark
    if (path.segments) {
      for (const segment of path.segments) {
        segment.points.forEach((p, i) => (i === 0 ? target.moveTo(p.x, p.y) : target.lineTo(p.x, p.y)))
        if (segment.closed && segment.points.length > 0)
          target.closePath()
      }
      return
    }
    if (path.d)
      target.addPath(new Path2D(path.d))
    return
  }
  if (mark.kind === 'group' || mark.kind === 'text')
    return
  markPath(mark as ShapeMark, target)
}

/** 按探针的画法填、描一条路径；alpha 是分组与刷选淡出之积。 */
function fillAndStroke(ctx: CanvasRenderingContext2D, paint: ChartPaint, alpha: number, path: Path2D): void {
  const base = alpha * paint.opacity
  if (paint.fill) {
    ctx.globalAlpha = base * paint.fillOpacity
    ctx.fillStyle = paint.fill
    ctx.fill(path)
  }
  if (paint.stroke && paint.strokeWidth > 0) {
    ctx.globalAlpha = base * paint.strokeOpacity
    ctx.strokeStyle = paint.stroke
    ctx.lineWidth = paint.strokeWidth
    ctx.lineJoin = paint.lineJoin
    ctx.lineCap = paint.lineCap
    ctx.setLineDash(paint.dash as number[])
    ctx.stroke(path)
    ctx.setLineDash([])
  }
}

/** 淡出的不透明度：令牌可以写成数或百分比。 */
function dimAlpha(root: Element): number {
  const view = root.ownerDocument.defaultView
  const text = view?.getComputedStyle(root).getPropertyValue('--xh-chart-dim-alpha').trim() ?? ''
  const value = Number.parseFloat(text)
  if (!Number.isFinite(value))
    return 1
  return Math.min(1, Math.max(0, text.endsWith('%') ? value / 100 : value))
}

/**
 * 画一帧。没有可画的数据时不清画布：画布正在淡出，留着上一帧淡完为止。
 * 返回 false 表示有系列的分组或探针还没被框架提交（新增的系列），下一帧补画。
 */
export function paintCartesianCanvas(params: EffectParams<CartesianChartSchema>, frame: ChartCanvasFrame): boolean {
  const model = cartesianModelOf(params)
  const target = model.scene
  if (!target || model.issues.length > 0 || cartesianIsEmpty(model))
    return true
  const { ctx, root, styles, sprites, dpr } = frame
  frame.clear()
  ctx.save()
  if (target.clip) {
    ctx.beginPath()
    ctx.rect(target.clip.x, target.clip.y, target.clip.width, target.clip.height)
    ctx.clip()
  }

  // 刷选：框外的数据标记按淡出的不透明度画
  const { context, prop } = params
  const brushMode = prop('brush') ?? 'none'
  const dirs = { x: brushMode === 'x' || brushMode === 'xy', y: brushMode === 'y' || brushMode === 'xy' }
  const brushing = context.get('brushing')
  const selection = dirs.x || dirs.y ? (brushing ? cartesianBrushingSelection(model, brushing, dirs) : context.get('brushSelection')) : null
  const brushed = new Set(selection ? cartesianBrushedRefs(model, selection).map(ref => `${ref.seriesId}|${ref.index}`) : [])
  const dimmed = selection ? dimAlpha(root) : 1
  const alphaOf = (mark: Mark): number => (selection && mark.datum && BRUSHED_PARTS.has(mark.part) && !brushed.has(`${mark.datum.seriesId}|${mark.datum.index}`) ? dimmed : 1)

  let complete = true
  for (const group of target.scene.layers.data) {
    if (group.kind !== 'group')
      continue
    const id = group.key.slice('series:'.length)
    const host = root.querySelector(`[data-scope="cartesian-chart"][data-part="series"][data-series-id="${escapeValue(id)}"]`)
    if (!host) {
      complete = false
      continue
    }
    const groupAlpha = styles.opacity(host)
    const found = new Map<string, ChartPaint | null>()
    const paintOf = (d: CartesianProbeDescriptor): ChartPaint | null => {
      const selector = probeSelector(d)
      if (!found.has(selector)) {
        const el = host.querySelector(selector)
        found.set(selector, el ? styles.read(el) : null)
      }
      return found.get(selector) ?? null
    }
    // 按值着色的点：三个锚点探针依次是色阶的起点、中点与终点，按皮肤里同样的两段 oklch 插值
    let ramp: ((t: number) => string) | null = null
    const rampOf = (): ((t: number) => string) | null => {
      if (!ramp) {
        const anchors = [...host.querySelectorAll(':scope > [data-part="point"][data-seg]')].map(el => styles.read(el).fillColor)
        if (anchors.length === 3 && anchors.every(Boolean))
          ramp = createColorRamp(anchors as NonNullable<typeof anchors[number]>[], 'oklch', 256, color => styles.color(formatCssColor(color)))
      }
      return ramp
    }

    // 相邻的同画法标记合成一条路径：批次在画法或淡出变了时结束
    let batch: { key: string, paint: ChartPaint, alpha: number, path: Path2D } | null = null
    const flushBatch = (): void => {
      if (batch)
        fillAndStroke(ctx, batch.paint, groupAlpha * batch.alpha, batch.path)
      batch = null
    }
    for (const mark of group.children) {
      const d = cartesianProbeDescriptor(mark)
      const paint = d.sequential ? paintOf({ ...d, sequential: false }) ?? null : paintOf(d)
      if (!paint && !d.sequential) {
        complete = false
        continue
      }
      const alpha = alphaOf(mark)
      if (isSymbol(mark)) {
        flushBatch()
        const own = d.sequential ? rampOf()?.(mark.paint?.t ?? 0) ?? null : null
        const style = paint ?? paintOf({ ...d, sequential: true })
        if (!style)
          continue
        const fill = own ?? (typeof style.fill === 'string' ? style.fill : null)
        const stroke = typeof style.stroke === 'string' ? style.stroke : null
        ctx.globalAlpha = groupAlpha * alpha * style.opacity
        sprites.draw(ctx, mark.symbol, mark.size, fill, stroke, style.strokeWidth, mark.x, mark.y, dpr)
        continue
      }
      const key = `${d.part}|${d.trend}|${d.style}|${alpha}`
      if (!batch || batch.key !== key) {
        flushBatch()
        batch = { key, paint: paint!, alpha, path: new Path2D() }
      }
      trace(batch.path, mark)
    }
    flushBatch()
  }
  ctx.restore()
  ctx.globalAlpha = 1
  return complete
}
