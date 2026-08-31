// 缓动曲线：CSS 侧的 cubic-bezier 字符串，与 JS 侧同名的采样函数。
// standard / easeIn / easeOut / outStrong 四条与 tokens primitive 的 ease.standard / in / out / out-strong 同值，真源是令牌，由门禁比对。

/** 命名缓动的 cubic-bezier 字符串，供 JS 动画引用。 */
export const easing = {
  linear: 'linear',
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
  decelerate: 'cubic-bezier(0, 0, 0, 1)',
  accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  outStrong: 'cubic-bezier(0.23, 1, 0.32, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

export type EasingName = keyof typeof easing

/** 归一化进度的映射：入参与出参都以 [0,1] 为定义域，出参允许越界（弹簧会过冲）。 */
export type EasingFunction = (t: number) => number

/** 四个控制点分量对应的 cubic-bezier 曲线，越界或非有限的分量按 0 处理。 */
const NEWTON_ITERATIONS = 8
const NEWTON_MIN_SLOPE = 1e-3
const SUBDIVISION_EPSILON = 1e-7
const SUBDIVISION_ITERATIONS = 12

function coefficients(a: number, b: number): [number, number, number] {
  const c = 3 * a
  const bb = 3 * (b - a) - c
  return [1 - c - bb, bb, c]
}

function sample(t: number, [a, b, c]: [number, number, number]): number {
  return ((a * t + b) * t + c) * t
}

function slope(t: number, [a, b, c]: [number, number, number]): number {
  return (3 * a * t + 2 * b) * t + c
}

function finite(value: number): number {
  return Number.isFinite(value) ? value : 0
}

/** 进度钳制到 [0,1]；NaN 按 0，正无穷按 1。 */
function clampProgress(t: number): number {
  if (t >= 1)
    return 1
  return t > 0 ? t : 0
}

const IDENTITY: EasingFunction = clampProgress

/**
 * 构造 cubic-bezier 缓动函数。x 分量钳制到 [0,1]，y 分量不钳制。
 *
 * 给定 x 反解参数 t 用牛顿迭代；导数过小时退回二分，避免在平段上除以近零斜率。
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFunction {
  const cx1 = Math.min(1, Math.max(0, finite(x1)))
  const cx2 = Math.min(1, Math.max(0, finite(x2)))
  const cy1 = finite(y1)
  const cy2 = finite(y2)

  if (cx1 === cy1 && cx2 === cy2)
    return IDENTITY

  const xc = coefficients(cx1, cx2)
  const yc = coefficients(cy1, cy2)

  function solve(x: number): number {
    let t = x
    for (let i = 0; i < NEWTON_ITERATIONS; i++) {
      const d = slope(t, xc)
      if (Math.abs(d) < NEWTON_MIN_SLOPE)
        break
      const error = sample(t, xc) - x
      if (Math.abs(error) < SUBDIVISION_EPSILON)
        return t
      t -= error / d
    }
    let lo = 0
    let hi = 1
    t = x
    for (let i = 0; i < SUBDIVISION_ITERATIONS; i++) {
      const error = sample(t, xc) - x
      if (Math.abs(error) < SUBDIVISION_EPSILON)
        break
      if (error > 0)
        hi = t
      else lo = t
      t = (lo + hi) / 2
    }
    return t
  }

  return (t) => {
    const progress = clampProgress(t)
    if (progress === 0 || progress === 1)
      return progress
    return sample(solve(progress), yc)
  }
}

/** 从 `cubic-bezier(a, b, c, d)` 字符串取四个分量，格式不符返回 null。 */
function parseCubicBezier(value: string): [number, number, number, number] | null {
  const inner = /^cubic-bezier\(([^)]*)\)$/.exec(value.trim())?.[1]
  if (inner === undefined)
    return null
  const parts = inner.split(',')
  if (parts.length !== 4)
    return null
  const [a = Number.NaN, b = Number.NaN, c = Number.NaN, d = Number.NaN] = parts.map(part => Number.parseFloat(part))
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || !Number.isFinite(d))
    return null
  return [a, b, c, d]
}

const cache = new Map<string, EasingFunction>()

/**
 * 把缓动的三种写法统一成函数：名字、`cubic-bezier(...)` / `linear` 字符串、或函数本身。
 *
 * 认不出的写法退回线性——写法可能来自 DOM 特性或配置，那是一个任意字符串。
 */
export function resolveEasing(value: EasingName | EasingFunction | string | undefined): EasingFunction {
  if (typeof value === 'function')
    return value
  if (value === undefined)
    return IDENTITY

  const text = value in easing ? easing[value as EasingName] : value
  const cached = cache.get(text)
  if (cached !== undefined)
    return cached

  const points = parseCubicBezier(text)
  const fn = points === null ? IDENTITY : cubicBezier(points[0], points[1], points[2], points[3])
  cache.set(text, fn)
  return fn
}

/** 在 [0,1] 上等距采样，产出 CSS `linear()` 缓动串。samples 会被钳制到 [2,100]。 */
export function toLinearEasing(fn: EasingFunction, samples = 24): string {
  const count = Math.min(100, Math.max(2, Math.trunc(Number.isFinite(samples) ? samples : 24)))
  const values: string[] = []
  for (let i = 0; i < count; i++) {
    const value = fn(i / (count - 1))
    values.push((Number.isFinite(value) ? value : 0).toFixed(4).replace(/\.?0+$/, ''))
  }
  return `linear(${values.join(', ')})`
}
