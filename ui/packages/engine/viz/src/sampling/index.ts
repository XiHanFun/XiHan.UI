/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 降采样：只作用于绘制，提示框、键盘遍历与数据表始终用原始数据。缺失的点是折线的断点，采样后原样保留。

import { invalidArgument } from '../errors'

type Channel<T> = (d: T, i: number) => number

/** 可见窗口内的点数超过绘图区宽度（CSS px）的两倍时需要降采样。 */
export function needsSampling(count: number, plotWidth: number): boolean {
  return count > plotWidth * 2
}

function checkCount(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0)
    throw invalidArgument(`${name} 必须是非负整数`, { [name]: value })
}

/** 按缺失点切段：每段是连续存在的下标区间，段与段之间记下第一个缺失点当断点。 */
function runs<T>(points: readonly T[], x: Channel<T>, y: Channel<T>): Array<{ indices: number[], gap?: number }> {
  const out: Array<{ indices: number[], gap?: number }> = []
  let current: number[] = []
  points.forEach((d, i) => {
    if (Number.isFinite(x(d, i)) && Number.isFinite(y(d, i))) {
      current.push(i)
      return
    }
    if (current.length > 0) {
      out.push({ indices: current, gap: i })
      current = []
    }
  })
  if (current.length > 0)
    out.push({ indices: current })
  return out
}

/** 按各段的点数分配名额，每段至少 min 个（不超过该段点数）。 */
function share(lengths: readonly number[], budget: number, min: number): number[] {
  const total = lengths.reduce((a, b) => a + b, 0)
  return lengths.map(n => Math.min(n, Math.max(min, Math.floor((budget * n) / Math.max(1, total)))))
}

/** 在一段连续存在的点上做 LTTB，返回选中的下标。 */
function lttbRun<T>(points: readonly T[], indices: readonly number[], threshold: number, x: Channel<T>, y: Channel<T>): number[] {
  const n = indices.length
  if (threshold >= n || n <= 2)
    return indices.slice()
  if (threshold <= 2)
    return [indices[0] as number, indices[n - 1] as number]
  const X = (k: number): number => x(points[indices[k] as number] as T, indices[k] as number)
  const Y = (k: number): number => y(points[indices[k] as number] as T, indices[k] as number)
  const out = [indices[0] as number]
  const size = (n - 2) / (threshold - 2)
  let a = 0
  for (let b = 0; b < threshold - 2; b++) {
    // 下一个桶的平均点作第三个顶点
    const nextStart = Math.floor((b + 1) * size) + 1
    const nextEnd = Math.min(Math.floor((b + 2) * size) + 1, n)
    let avgX = 0
    let avgY = 0
    for (let k = nextStart; k < nextEnd; k++) {
      avgX += X(k)
      avgY += Y(k)
    }
    const count = Math.max(1, nextEnd - nextStart)
    avgX /= count
    avgY /= count
    // 当前桶里与上一个选中点、下一桶平均点围成三角形面积最大的点
    const start = Math.floor(b * size) + 1
    const end = Math.floor((b + 1) * size) + 1
    const ax = X(a)
    const ay = Y(a)
    let best = start
    let bestArea = -1
    for (let k = start; k < end; k++) {
      const area = Math.abs((ax - avgX) * (Y(k) - ay) - (ax - X(k)) * (avgY - ay))
      if (area > bestArea) {
        bestArea = area
        best = k
      }
    }
    out.push(indices[best] as number)
    a = best
  }
  out.push(indices[n - 1] as number)
  return out
}

/**
 * LTTB（Largest-Triangle-Three-Buckets）：保留首尾，其余每个桶里保留与前一个选中点、
 * 下一桶平均点围成三角形面积最大的点，形状最忠实。结果是原数据的子序列；缺失的点作为断点保留。
 */
export function lttb<T>(points: readonly T[], threshold: number, x: Channel<T>, y: Channel<T>): T[] {
  checkCount('threshold', threshold)
  if (threshold >= points.length)
    return points.slice()
  const segments = runs(points, x, y)
  const quotas = share(segments.map(s => s.indices.length), threshold - segments.filter(s => s.gap !== undefined).length, 2)
  const picked: number[] = []
  segments.forEach((segment, i) => {
    picked.push(...lttbRun(points, segment.indices, quotas[i] as number, x, y))
    if (segment.gap !== undefined)
      picked.push(segment.gap)
  })
  return picked.map(i => points[i] as T)
}

/**
 * min-max：按下标均分成 buckets 个桶，每桶保留首、最小、最大、末四个点（去重、按原顺序），
 * 监控类数据的尖峰不会丢。缺失的点作为断点保留。
 */
export function minMax<T>(points: readonly T[], buckets: number, x: Channel<T>, y: Channel<T>): T[] {
  checkCount('buckets', buckets)
  if (buckets * 4 >= points.length)
    return points.slice()
  const segments = runs(points, x, y)
  const quotas = share(segments.map(s => s.indices.length), buckets, 1)
  const picked: number[] = []
  segments.forEach((segment, s) => {
    const { indices } = segment
    const count = Math.max(1, quotas[s] as number)
    const size = indices.length / count
    for (let b = 0; b < count; b++) {
      const start = Math.floor(b * size)
      const end = Math.max(start + 1, Math.floor((b + 1) * size))
      let low = start
      let high = start
      for (let k = start; k < end; k++) {
        const value = y(points[indices[k] as number] as T, indices[k] as number)
        if (value < y(points[indices[low] as number] as T, indices[low] as number))
          low = k
        if (value > y(points[indices[high] as number] as T, indices[high] as number))
          high = k
      }
      for (const k of [...new Set([start, low, high, end - 1])].sort((p, q) => p - q))
        picked.push(indices[k] as number)
    }
    if (segment.gap !== undefined)
      picked.push(segment.gap)
  })
  return picked.map(i => points[i] as T)
}

/** average：按下标均分成 buckets 个桶，每桶取 x、y 的平均。结果是新的点，不再对应原数据；缺失的点不参与。 */
export function average<T>(points: readonly T[], buckets: number, x: Channel<T>, y: Channel<T>): Array<{ x: number, y: number }> {
  checkCount('buckets', buckets)
  const defined = points
    .map((d, i) => ({ x: x(d, i), y: y(d, i) }))
    .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y))
  if (buckets >= defined.length)
    return defined
  const size = defined.length / buckets
  return Array.from({ length: buckets }, (_, b) => {
    const slice = defined.slice(Math.floor(b * size), Math.floor((b + 1) * size))
    return {
      x: slice.reduce((s, p) => s + p.x, 0) / slice.length,
      y: slice.reduce((s, p) => s + p.y, 0) / slice.length,
    }
  })
}
