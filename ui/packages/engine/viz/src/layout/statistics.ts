/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 统计布局：瀑布的累计、箱线的五数与离群点、核密度（小提琴图）、最小二乘回归与移动平均（趋势注释）。
// 只做数，不做几何：像素由调用方的比例尺换算。缺失值（null、undefined、NaN）一律跳过，不按 0 算。

import { deviation, isPresent, quantileSorted } from '../array/statistics'
import { invalidArgument } from '../errors'

/* ---------- 瀑布 ---------- */

/** 瀑布的一步：base 是这一步画在哪儿起，end 是画到哪儿止，value 是这一步本身的增减。 */
export interface WaterfallStep {
  readonly base: number
  readonly end: number
  readonly value: number
  /** 小计：从 0 画到当前累计值，value 是累计值本身。 */
  readonly total: boolean
  /** 这一步是涨还是跌；小计按累计值的正负。 */
  readonly trend: 'rise' | 'fall'
}

/**
 * 瀑布：逐步累计。普通一步接在上一步的累计值上，画出这一步的增减；小计一步从 0 画到当前累计值，
 * 它的数值字段被忽略（小计本来就是算出来的）。缺失值的一步不画、也不改变累计。
 */
export function waterfall(values: readonly (number | null | undefined)[], totals: readonly boolean[] = []): (WaterfallStep | null)[] {
  let running = 0
  return values.map((raw, i) => {
    if (totals[i]) {
      return { base: 0, end: running, value: running, total: true, trend: running < 0 ? 'fall' : 'rise' }
    }
    if (!isPresent(raw))
      return null
    const base = running
    running += raw
    return { base, end: running, value: raw, total: false, trend: raw < 0 ? 'fall' : 'rise' }
  })
}

/* ---------- 箱线 ---------- */

/** 箱线的统计量：五数、四分距与须线以外的离群点。 */
export interface BoxplotStats {
  readonly count: number
  readonly q1: number
  readonly median: number
  readonly q3: number
  readonly iqr: number
  /** 须线的两端：1.5 倍四分距以内最远的数据点。 */
  readonly lowWhisker: number
  readonly highWhisker: number
  /** 须线以外的数据点，升序。 */
  readonly outliers: readonly number[]
  readonly min: number
  readonly max: number
  readonly mean: number
}

/**
 * Tukey 箱线：四分位按 R-7（与 Excel、NumPy 缺省一致）；须线延伸到 k 倍四分距以内最远的那个数据点，
 * 其外为离群点。没有一个有效值时返回 null。
 */
export function boxplotStats(values: Iterable<number | null | undefined>, options: { whisker?: number } = {}): BoxplotStats | null {
  const k = options.whisker ?? 1.5
  if (!(k >= 0))
    throw invalidArgument('须线倍数必须是非负数', { whisker: k })
  const sorted = [...values].filter(isPresent).sort((a, b) => a - b)
  if (sorted.length === 0)
    return null
  const q1 = quantileSorted(sorted, 0.25)!
  const median = quantileSorted(sorted, 0.5)!
  const q3 = quantileSorted(sorted, 0.75)!
  const iqr = q3 - q1
  const lowFence = q1 - k * iqr
  const highFence = q3 + k * iqr
  const inside = sorted.filter(v => v >= lowFence && v <= highFence)
  let total = 0
  for (const v of sorted)
    total += v
  return {
    count: sorted.length,
    q1,
    median,
    q3,
    iqr,
    lowWhisker: inside[0] ?? q1,
    highWhisker: inside.at(-1) ?? q3,
    outliers: sorted.filter(v => v < lowFence || v > highFence),
    min: sorted[0]!,
    max: sorted.at(-1)!,
    mean: total / sorted.length,
  }
}

/* ---------- 核密度 ---------- */

export type KernelName = 'gaussian' | 'epanechnikov'

const KERNELS: Record<KernelName, (u: number) => number> = {
  gaussian: u => Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI),
  epanechnikov: u => (Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0),
}

/** Silverman 经验带宽：0.9 · min(σ, IQR / 1.34) · n^(−1/5)；数据全相等时退回 1。 */
export function silvermanBandwidth(values: readonly number[]): number {
  const sorted = values.filter(isPresent).sort((a, b) => a - b)
  if (sorted.length < 2)
    return 1
  const sigma = deviation(sorted) ?? 0
  const iqr = quantileSorted(sorted, 0.75)! - quantileSorted(sorted, 0.25)!
  const spread = Math.min(sigma, iqr / 1.34) || sigma || iqr
  return spread > 0 ? 0.9 * spread * sorted.length ** -0.2 : 1
}

/** 核密度估计的一个取样点：位置与密度。 */
export interface DensityPoint {
  readonly value: number
  readonly density: number
}

/**
 * 核密度估计：在 [min − 带宽, max + 带宽] 上均匀取 points 个点，求每点的密度。
 * 用于小提琴图的轮廓；带宽缺省按 Silverman 规则。
 */
export function kde(values: Iterable<number | null | undefined>, options: { bandwidth?: number, kernel?: KernelName, points?: number, extent?: readonly [number, number] } = {}): DensityPoint[] {
  const data = [...values].filter(isPresent)
  if (data.length === 0)
    return []
  const bandwidth = options.bandwidth ?? silvermanBandwidth(data)
  if (!(bandwidth > 0))
    throw invalidArgument('带宽必须是正数', { bandwidth })
  const count = Math.max(2, Math.floor(options.points ?? 40))
  const kernel = KERNELS[options.kernel ?? 'gaussian']
  const lo = options.extent?.[0] ?? Math.min(...data) - bandwidth
  const hi = options.extent?.[1] ?? Math.max(...data) + bandwidth
  const out: DensityPoint[] = []
  for (let i = 0; i < count; i++) {
    const x = lo + ((hi - lo) * i) / (count - 1)
    let sum = 0
    for (const v of data)
      sum += kernel((x - v) / bandwidth)
    out.push({ value: x, density: sum / (data.length * bandwidth) })
  }
  return out
}

/* ---------- 回归与平滑 ---------- */

/** 最小二乘直线：y = slope · x + intercept，r2 是决定系数。 */
export interface LinearFit {
  readonly slope: number
  readonly intercept: number
  readonly r2: number
  readonly predict: (x: number) => number
}

/** 最小二乘线性回归：少于两个有效点、或 x 全相等时返回 null。 */
export function linearRegression(points: readonly { readonly x: number | null | undefined, readonly y: number | null | undefined }[]): LinearFit | null {
  const valid = points.filter((p): p is { x: number, y: number } => isPresent(p.x) && isPresent(p.y))
  const n = valid.length
  if (n < 2)
    return null
  let mx = 0
  let my = 0
  for (const p of valid) {
    mx += p.x
    my += p.y
  }
  mx /= n
  my /= n
  let sxx = 0
  let sxy = 0
  let syy = 0
  for (const p of valid) {
    sxx += (p.x - mx) ** 2
    sxy += (p.x - mx) * (p.y - my)
    syy += (p.y - my) ** 2
  }
  if (sxx === 0)
    return null
  const slope = sxy / sxx
  const intercept = my - slope * mx
  const r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy)
  return { slope, intercept, r2, predict: x => slope * x + intercept }
}

/**
 * 移动平均：第 i 个值取它与之前共 window 个值的均值（尾随窗口）；窗口里的缺失值跳过，
 * 窗口里一个有效值都没有、或还凑不满 window 个位置时为 null。
 */
export function movingAverage(values: readonly (number | null | undefined)[], window: number): (number | null)[] {
  const size = Math.floor(window)
  if (!(size >= 1))
    throw invalidArgument('移动平均的窗口必须是正整数', { window })
  return values.map((_, i) => {
    if (i + 1 < size)
      return null
    let sum = 0
    let count = 0
    for (let k = i - size + 1; k <= i; k++) {
      const v = values[k]
      if (isPresent(v)) {
        sum += v
        count += 1
      }
    }
    return count > 0 ? sum / count : null
  })
}
