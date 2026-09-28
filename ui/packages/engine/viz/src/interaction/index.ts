/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 缩放与刷选的数学：窗口用定义域的比例 [0, 1] 表达，缩放、平移、夹取都在比例上做，
// 再按比例尺的种类换回定义域值。手势与事件不在这里：它们由调用方换成锚点、倍数与位移交进来。

import { invalidArgument } from '../errors'

/** 轴上的一段窗口：定义域的比例，start ≤ end，都在 [0, 1] 内。 */
export interface AxisWindow {
  readonly start: number
  readonly end: number
}

/** 窗口能缩到多窄、放到多宽（比例）。 */
export interface WindowLimits {
  /** 最窄的跨度，缺省 0.01（放大到 100 倍为止）。 */
  readonly minSpan?: number
  /** 最宽的跨度，缺省 1（整条轴）。 */
  readonly maxSpan?: number
}

/** 整条轴：未缩放时的窗口。 */
export const FULL_WINDOW: AxisWindow = /* @__PURE__ */ Object.freeze({ start: 0, end: 1 })

const DEFAULT_MIN_SPAN = 0.01

function checkWindow(w: AxisWindow): void {
  if (!Number.isFinite(w.start) || !Number.isFinite(w.end) || w.start > w.end)
    throw invalidArgument('窗口的两端必须是有限数且 start ≤ end', { window: w })
}

function spans(limits: WindowLimits | undefined): [number, number] {
  const min = limits?.minSpan ?? DEFAULT_MIN_SPAN
  const max = limits?.maxSpan ?? 1
  if (!(min > 0) || !(max > 0) || min > max || max > 1)
    throw invalidArgument('窗口的跨度界限必须满足 0 < minSpan ≤ maxSpan ≤ 1', { minSpan: min, maxSpan: max })
  return [min, max]
}

/** 把窗口推回 [0, 1] 内：跨度不变，越出哪端就整体挪回来；跨度本身超过 1 时取整条轴。 */
export function clampWindow(w: AxisWindow): AxisWindow {
  checkWindow(w)
  const span = w.end - w.start
  if (span >= 1)
    return FULL_WINDOW
  if (w.start < 0)
    return { start: 0, end: span }
  if (w.end > 1)
    return { start: 1 - span, end: 1 }
  return w
}

/**
 * 以锚点为中心缩放：锚点是窗口里的相对位置 0–1（指针或焦点所在处），缩放前后锚点对着的定义域值不动。
 * factor > 1 放大（窗口变窄），< 1 缩小。跨度夹在界限内，最后推回 [0, 1]。
 */
export function zoomAt(w: AxisWindow, anchor: number, factor: number, limits?: WindowLimits): AxisWindow {
  checkWindow(w)
  if (!(factor > 0) || !Number.isFinite(factor))
    throw invalidArgument('缩放倍数必须是正的有限数', { factor })
  const [minSpan, maxSpan] = spans(limits)
  const span = w.end - w.start
  const next = Math.min(maxSpan, Math.max(minSpan, span / factor))
  const at = Math.min(1, Math.max(0, Number.isFinite(anchor) ? anchor : 0.5))
  const pivot = w.start + span * at
  return clampWindow({ start: pivot - next * at, end: pivot - next * at + next })
}

/** 平移：delta 是窗口跨度的倍数（正值往定义域的末端挪），到头就停。 */
export function pan(w: AxisWindow, delta: number): AxisWindow {
  checkWindow(w)
  if (!Number.isFinite(delta))
    throw invalidArgument('平移量必须是有限数', { delta })
  const span = w.end - w.start
  return clampWindow({ start: w.start + delta * span, end: w.end + delta * span })
}

/** 窗口是不是整条轴。 */
export function isFullWindow(w: AxisWindow): boolean {
  return w.start <= 0 && w.end >= 1
}

/** 连续轴的换算方式：linear / time 按原值，log 按对数，symlog 按 sign · log1p(|x|)。 */
export type WindowScaleKind = 'linear' | 'time' | 'log' | 'symlog'

function forward(kind: WindowScaleKind, value: number): number {
  if (kind === 'log')
    return Math.log(value)
  if (kind === 'symlog')
    return Math.sign(value) * Math.log1p(Math.abs(value))
  return value
}

function backward(kind: WindowScaleKind, value: number): number {
  if (kind === 'log')
    return Math.exp(value)
  if (kind === 'symlog')
    return Math.sign(value) * Math.expm1(Math.abs(value))
  return value
}

/** 窗口换回连续轴的定义域：[起, 止]。 */
export function windowToDomain(w: AxisWindow, full: readonly [number, number], kind: WindowScaleKind = 'linear'): [number, number] {
  checkWindow(w)
  const [a, b] = [forward(kind, full[0]), forward(kind, full[1])]
  if (!Number.isFinite(a) || !Number.isFinite(b))
    throw invalidArgument('完整定义域在这种比例尺下没有意义', { full, kind })
  return [backward(kind, a + (b - a) * w.start), backward(kind, a + (b - a) * w.end)]
}

/** 连续轴的一段定义域换成窗口；越出完整定义域的部分夹回来，整段都在外面时落成贴着那一端的零宽窗口。 */
export function domainToWindow(domain: readonly [number, number], full: readonly [number, number], kind: WindowScaleKind = 'linear'): AxisWindow {
  const [a, b] = [forward(kind, full[0]), forward(kind, full[1])]
  const [x, y] = [forward(kind, domain[0]), forward(kind, domain[1])]
  if (![a, b, x, y].every(Number.isFinite) || a === b)
    throw invalidArgument('定义域换不成窗口', { domain, full, kind })
  const start = (Math.min(x, y) - a) / (b - a)
  const end = (Math.max(x, y) - a) / (b - a)
  const unit = (v: number): number => Math.min(1, Math.max(0, v))
  return clampWindow({ start: unit(Math.min(start, end)), end: unit(Math.max(start, end)) })
}

/**
 * 类目轴的窗口取整到类目边界：返回窗口覆盖的类目下标 [first, last]（含两端），至少一个类目。
 * 一个类目只露出一小截也算在窗口里，免得边上的柱被切成半根。
 */
export function windowToIndexRange(w: AxisWindow, count: number): [number, number] {
  checkWindow(w)
  if (count <= 0)
    return [0, -1]
  const first = Math.min(count - 1, Math.max(0, Math.floor(w.start * count + 1e-9)))
  const last = Math.min(count - 1, Math.max(first, Math.ceil(w.end * count - 1e-9) - 1))
  return [first, last]
}

/** 类目下标范围换成窗口：窗口两端正好落在类目边界上。 */
export function indexRangeToWindow(first: number, last: number, count: number): AxisWindow {
  if (count <= 0)
    return FULL_WINDOW
  const lo = Math.min(Math.max(0, Math.min(first, last)), count - 1)
  const hi = Math.min(Math.max(0, Math.max(first, last)), count - 1)
  return { start: lo / count, end: (hi + 1) / count }
}

/** 一段像素在轴上对应的窗口比例：像素区间按轴的像素两端归一；轴反向（纵轴自下而上）时照样得到 start ≤ end。 */
export function pixelsToWindow(pixels: readonly [number, number], range: readonly [number, number]): AxisWindow {
  const [r0, r1] = range
  if (r0 === r1)
    throw invalidArgument('轴的像素两端重合，换不出比例', { range })
  const t0 = (pixels[0] - r0) / (r1 - r0)
  const t1 = (pixels[1] - r0) / (r1 - r0)
  return { start: Math.max(0, Math.min(t0, t1)), end: Math.min(1, Math.max(t0, t1)) }
}
