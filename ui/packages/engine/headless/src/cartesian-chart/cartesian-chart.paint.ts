/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 直角坐标图的画布数据层：场景的数据层原样画上去，几何与 SVG 同一份（markPath 写进 Canvas 2D 上下文），
// 颜色、线宽、虚线、纹理与淡出一律读系列分组里同部件的样式探针。相同画法的相邻标记合成一条路径一次填、一次描；
// 点逐个贴精灵图，按数据次序叠放。刷选时框外的标记按淡出的不透明度画。
// 列式数据不经过场景：画布图层里是降采样后的像素坐标，按系列一种画法一条路径，探针取法相同。

import type { EffectParams } from '@xihan-ui/core'
import type { Mark, PathMark, RectMark, ShapeMark, SymbolMark, SymbolName } from '@xihan-ui/viz'
import type { ChartCanvasFrame, ChartPaint } from '../shared/chart'
import type { CartesianRaster, CartesianRasterSeries } from './cartesian-chart.columns'
import type { CartesianProbeDescriptor } from './cartesian-chart.logic'
import type { CartesianChartSchema } from './cartesian-chart.schema'
import { markPath } from '@xihan-ui/viz'
import { createColorRamp, formatCssColor, traceBand, tracePolyline } from '@xihan-ui/viz/canvas'
import {
  cartesianBrushedRefs,
  cartesianBrushingSelection,
  cartesianIsEmpty,
  cartesianModelOf,
  cartesianProbeDescriptor,
} from './cartesian-chart.logic'
import { crisp } from './cartesian-chart.model'

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

/** 一个系列分组的样式：分组的不透明度（图例悬停时的淡出）、按描述取探针的画法、按值着色的色阶。 */
interface SeriesStyles {
  readonly alpha: number
  readonly paintOf: (d: CartesianProbeDescriptor) => ChartPaint | null
  readonly rampOf: () => ((t: number) => string) | null
}

/** 系列分组还没被框架提交（新增的系列）时为 null。 */
function seriesStylesOf(frame: ChartCanvasFrame, id: string): SeriesStyles | null {
  const { root, styles } = frame
  const host = root.querySelector(`[data-scope="cartesian-chart"][data-part="series"][data-series-id="${escapeValue(id)}"]`)
  if (!host)
    return null
  const found = new Map<string, ChartPaint | null>()
  let ramp: ((t: number) => string) | null = null
  return {
    alpha: styles.opacity(host),
    paintOf: (d) => {
      const selector = probeSelector(d)
      if (!found.has(selector)) {
        const el = host.querySelector(selector)
        found.set(selector, el ? styles.read(el) : null)
      }
      return found.get(selector) ?? null
    },
    // 按值着色的点：三个锚点探针依次是色阶的起点、中点与终点，按皮肤里同样的两段 oklch 插值
    rampOf: () => {
      if (!ramp) {
        const anchors = [...host.querySelectorAll(':scope > [data-part="point"][data-seg]')].map(el => styles.read(el).fillColor)
        if (anchors.length === 3 && anchors.every(Boolean))
          ramp = createColorRamp(anchors as NonNullable<typeof anchors[number]>[], 'oklch', 256, color => styles.color(formatCssColor(color)))
      }
      return ramp
    },
  }
}

function probe(part: string, trend: 'rise' | 'fall' | null = null, style: CartesianProbeDescriptor['style'] = null, sequential = false): CartesianProbeDescriptor {
  return { part, trend, style, sequential }
}

/** 贴一个点的精灵图：填充取给定的颜色或探针的填充（纹理填充不进精灵图）。 */
function drawSymbol(ctx: CanvasRenderingContext2D, frame: ChartCanvasFrame, paint: ChartPaint, alpha: number, symbol: SymbolName, size: number, fill: string | null, x: number, y: number): void {
  ctx.globalAlpha = alpha * paint.opacity
  frame.sprites.draw(ctx, symbol, size, fill ?? (typeof paint.fill === 'string' ? paint.fill : null), typeof paint.stroke === 'string' ? paint.stroke : null, paint.strokeWidth, x, y, frame.dpr)
}

/** 列式数据的一个系列：返回 false 表示有要用的探针还没被提交。 */
function paintRasterSeries(ctx: CanvasRenderingContext2D, frame: ChartCanvasFrame, r: CartesianRasterSeries, st: SeriesStyles, metrics: { pointSize: number, radius: number }, symbol: SymbolName): boolean {
  let complete = true
  const need = (d: CartesianProbeDescriptor): ChartPaint | null => {
    const paint = st.paintOf(d)
    if (!paint)
      complete = false
    return paint
  }
  const dotSize = Math.PI * (metrics.pointSize / 2) ** 2
  switch (r.kind) {
    case 'line': {
      // 面积与区间带先铺，线描在上面；点稀时逐点画点
      if (r.base != null) {
        const fill = need(probe('area-fill'))
        if (fill) {
          const path = new Path2D()
          traceBand(path, r.xs, r.ys, r.base, r.count, r.step)
          fillAndStroke(ctx, fill, st.alpha, path)
        }
      }
      if (r.stroke) {
        const line = need(probe('line'))
        if (line) {
          const path = new Path2D()
          tracePolyline(path, r.xs, r.ys, r.count, r.step)
          fillAndStroke(ctx, line, st.alpha, path)
        }
      }
      if (r.dots) {
        const dot = need(probe('dot'))
        if (dot) {
          for (let k = 0; k < r.dots.count; k++)
            drawSymbol(ctx, frame, dot, st.alpha, 'circle', dotSize, null, r.dots.xs[k] as number, r.dots.ys[k] as number)
        }
      }
      break
    }
    case 'scatter': {
      const point = need(probe('point'))
      const ramp = r.t ? st.rampOf() : null
      if (r.t && !ramp)
        complete = false
      if (!point)
        break
      // 气泡大的垫在下面：与 SVG 里的叠放次序一致
      let order: ArrayLike<number> | null = null
      if (r.radius) {
        const radius = r.radius
        order = Int32Array.from({ length: r.count }, (_, k) => k).sort((a, b) => (radius[b] as number) - (radius[a] as number))
      }
      for (let n = 0; n < r.count; n++) {
        const k = order ? order[n] as number : n
        const radius = r.radius ? r.radius[k] as number : metrics.pointSize / 2
        if (!(radius > 0))
          continue
        const t = r.t ? r.t[k] as number : Number.NaN
        const fill = ramp && Number.isFinite(t) ? ramp(t) : null
        drawSymbol(ctx, frame, point, st.alpha, symbol, Math.PI * radius * radius, fill, r.xs[k] as number, r.ys[k] as number)
      }
      break
    }
    case 'candles': {
      const half = r.width / 2
      const trends = ['fall', 'rise'] as const
      if (r.style === 'ohlc') {
        for (const [rise, trend] of trends.entries()) {
          const paint = need(probe('candle', trend, 'ohlc'))
          if (!paint)
            continue
          const path = new Path2D()
          for (let k = 0; k < r.count; k++) {
            if (r.rise[k] !== rise)
              continue
            const c = crisp(r.x[k] as number)
            path.moveTo(c, r.high[k] as number)
            path.lineTo(c, r.low[k] as number)
            path.moveTo(c - half, r.open[k] as number)
            path.lineTo(c, r.open[k] as number)
            path.moveTo(c, r.close[k] as number)
            path.lineTo(c + half, r.close[k] as number)
          }
          fillAndStroke(ctx, paint, st.alpha, path)
        }
        break
      }
      // 影线在下、实体在上：影线对齐到像素中心，实体以同一个中心摆放
      for (const part of ['wick', 'candle'] as const) {
        for (const [rise, trend] of trends.entries()) {
          const paint = need(probe(part, trend, part === 'candle' ? 'candle' : null))
          if (!paint)
            continue
          const path = new Path2D()
          for (let k = 0; k < r.count; k++) {
            if (r.rise[k] !== rise)
              continue
            const c = crisp(r.x[k] as number)
            if (part === 'wick') {
              path.moveTo(c, r.high[k] as number)
              path.lineTo(c, r.low[k] as number)
              continue
            }
            const lo = Math.min(r.open[k] as number, r.close[k] as number)
            const hi = Math.max(r.open[k] as number, r.close[k] as number)
            path.rect(c - half, lo, r.width, Math.max(1, hi - lo))
          }
          fillAndStroke(ctx, paint, st.alpha, path)
        }
      }
      break
    }
    case 'bars': {
      // 柱的圆角只在远离基线的一端：几何交给 markPath，与 SVG 同一份
      const radius = Math.min(metrics.radius, r.width / 2)
      for (const [code, trend] of [[0, null], [1, 'rise'], [-1, 'fall']] as const) {
        let path: Path2D | null = null
        for (let k = 0; k < r.count; k++) {
          const top = r.top[k] as number
          if (r.trend[k] !== code || !Number.isFinite(top))
            continue
          path ??= new Path2D()
          const rect: RectMark = {
            kind: 'rect',
            key: '',
            part: 'bar',
            x: (r.x[k] as number) - r.width / 2,
            y: Math.min(top, r.base),
            width: r.width,
            height: Math.abs(r.base - top),
            cornerRadius: radius,
            orientation: 'vertical',
            baseline: top <= r.base ? 'end' : 'start',
          }
          markPath(rect, path)
        }
        const paint = path ? need(probe('bar', trend)) : null
        if (path && paint)
          fillAndStroke(ctx, paint, st.alpha, path)
      }
      break
    }
  }
  return complete
}

function paintRaster(ctx: CanvasRenderingContext2D, frame: ChartCanvasFrame, raster: CartesianRaster, metrics: { pointSize: number, radius: number }, symbolOf: (id: string) => SymbolName): boolean {
  let complete = true
  for (const r of raster.series) {
    const st = seriesStylesOf(frame, r.id)
    if (!st) {
      complete = false
      continue
    }
    if (!paintRasterSeries(ctx, frame, r, st, metrics, symbolOf(r.id)))
      complete = false
  }
  return complete
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
  const { ctx, root } = frame
  frame.clear()
  ctx.save()
  if (target.clip) {
    ctx.beginPath()
    ctx.rect(target.clip.x, target.clip.y, target.clip.width, target.clip.height)
    ctx.clip()
  }

  const columns = model.columns
  if (columns?.raster && columns.layout) {
    const symbols = new Map(model.spec.series.map(s => [s.id, s.symbol ?? 'circle']))
    const complete = paintRaster(ctx, frame, columns.raster, columns.layout.metrics, id => symbols.get(id) ?? 'circle')
    ctx.restore()
    ctx.globalAlpha = 1
    return complete
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
    const st = seriesStylesOf(frame, group.key.slice('series:'.length))
    if (!st) {
      complete = false
      continue
    }

    // 相邻的同画法标记合成一条路径：批次在画法或淡出变了时结束
    let batch: { key: string, paint: ChartPaint, alpha: number, path: Path2D } | null = null
    const flushBatch = (): void => {
      if (batch)
        fillAndStroke(ctx, batch.paint, st.alpha * batch.alpha, batch.path)
      batch = null
    }
    for (const mark of group.children) {
      const d = cartesianProbeDescriptor(mark)
      const paint = d.sequential ? st.paintOf({ ...d, sequential: false }) ?? null : st.paintOf(d)
      if (!paint && !d.sequential) {
        complete = false
        continue
      }
      const alpha = alphaOf(mark)
      if (isSymbol(mark)) {
        flushBatch()
        const own = d.sequential ? st.rampOf()?.(mark.paint?.t ?? 0) ?? null : null
        const style = paint ?? st.paintOf({ ...d, sequential: true })
        if (!style)
          continue
        drawSymbol(ctx, frame, style, st.alpha * alpha, mark.symbol, mark.size, own, mark.x, mark.y)
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
