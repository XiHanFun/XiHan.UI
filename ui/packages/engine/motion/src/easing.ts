/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 缓动曲线：CSS 侧的 cubic-bezier 字符串，与 JS 侧同名的采样函数。
// 与 tokens primitive 的 ease.* 同值的各条，真源是令牌，由门禁逐条比对；没有令牌对应的几条在门禁里登记理由。

/** 命名缓动的 cubic-bezier 字符串，供 JS 动画引用。 */
export const easing = {
  linear: 'linear',
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  outStrong: 'cubic-bezier(0.23, 1, 0.32, 1)',
  outFluid: 'cubic-bezier(0.32, 0.72, 0, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  outBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  sineInOut: 'cubic-bezier(0.37, 0, 0.63, 1)',
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

/** CSS 的 <number>：可带符号、小数与指数。 */
const NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/
/** CSS 的 <integer>：可带符号，不带小数点与指数。 */
const INTEGER = /^[+-]?\d+$/

function parseNumber(text: string): number | null {
  return NUMBER.test(text) ? Number(text) : null
}

function parsePercent(text: string): number | null {
  if (!text.endsWith('%'))
    return null
  const value = parseNumber(text.slice(0, -1))
  return value === null ? null : value / 100
}

/** CSS 缓动关键字的控制点，取值与 CSS 规范一致。 */
const CSS_BEZIER_KEYWORDS: ReadonlyMap<string, readonly [number, number, number, number]> = new Map([
  ['ease', [0.25, 0.1, 0.25, 1]],
  ['ease-in', [0.42, 0, 1, 1]],
  ['ease-out', [0, 0, 0.58, 1]],
  ['ease-in-out', [0.42, 0, 0.58, 1]],
])

type StepPosition = 'jump-start' | 'jump-end' | 'jump-none' | 'jump-both'

/** steps() 的位置词；start / end 是 jump-start / jump-end 的别名。 */
const STEP_POSITIONS: ReadonlyMap<string, StepPosition> = new Map([
  ['jump-start', 'jump-start'],
  ['jump-end', 'jump-end'],
  ['jump-none', 'jump-none'],
  ['jump-both', 'jump-both'],
  ['start', 'jump-start'],
  ['end', 'jump-end'],
])

/** 阶跃缓动：count 段，position 决定起点与终点各算不算一跳。 */
function stepsEasing(count: number, position: StepPosition): EasingFunction {
  const jumps = position === 'jump-none' ? count - 1 : position === 'jump-both' ? count + 1 : count
  const leading = position === 'jump-start' || position === 'jump-both' ? 1 : 0
  return (t) => {
    const step = Math.floor(clampProgress(t) * count) + leading
    return Math.min(step, jumps) / jumps
  }
}

/** `cubic-bezier(x1, y1, x2, y2)` 的参数：四个数，两个 x 分量在 [0,1] 内。 */
function parseCubicBezierArgs(args: string[]): EasingFunction | null {
  if (args.length !== 4)
    return null
  const [x1, y1, x2, y2] = args.map(parseNumber)
  if (x1 == null || y1 == null || x2 == null || y2 == null)
    return null
  if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1)
    return null
  return cubicBezier(x1, y1, x2, y2)
}

/** `steps(<integer>[, <step-position>])` 的参数。 */
function parseStepsArgs(args: string[]): EasingFunction | null {
  if (args.length < 1 || args.length > 2 || !INTEGER.test(args[0]!))
    return null
  const count = Number(args[0])
  const position = args.length === 2 ? STEP_POSITIONS.get(args[1]!) : 'jump-end'
  if (position === undefined || count < (position === 'jump-none' ? 2 : 1))
    return null
  return stepsEasing(count, position)
}

interface LinearPoint {
  input: number
  output: number
}

/**
 * `linear(...)` 的参数：至少两个停靠点，每个停靠点一个输出值，前后可带一到两个百分比输入位。
 *
 * 缺了输入位的：首个取 0，末个取 1，中间的在前后已知输入位之间等分；
 * 输入位比前面最大的还小时抬到前面最大的那个，保证单调。
 */
function parseLinearArgs(args: string[]): EasingFunction | null {
  if (args.length < 2)
    return null
  const draft: Array<{ input: number | null, output: number }> = []
  let largest = Number.NEGATIVE_INFINITY
  for (const [index, stop] of args.entries()) {
    const parts = stop.split(/\s+/)
    if (parts.length > 3)
      return null
    // 输出值写在最前或最后，百分比挨在一起
    const at = NUMBER.test(parts[0]!) ? 0 : parts.length - 1
    const output = parseNumber(parts[at]!)
    const inputs = parts.filter((_, i) => i !== at).map(parsePercent)
    if (output === null || inputs.includes(null))
      return null
    if (inputs.length > 0) {
      for (const input of inputs as number[]) {
        largest = Math.max(input, largest)
        draft.push({ input: largest, output })
      }
    }
    else if (index === 0) {
      largest = 0
      draft.push({ input: 0, output })
    }
    else if (index === args.length - 1) {
      largest = Math.max(1, largest)
      draft.push({ input: largest, output })
    }
    else {
      draft.push({ input: null, output })
    }
  }

  const points: LinearPoint[] = []
  for (const [index, point] of draft.entries()) {
    if (point.input !== null) {
      points.push({ input: point.input, output: point.output })
      continue
    }
    const before = points[index - 1]!
    const after = draft.findIndex((next, i) => i > index && next.input !== null)
    const span = after - (index - 1)
    points.push({ input: before.input + (draft[after]!.input! - before.input) / span, output: point.output })
  }

  return (t) => {
    const x = clampProgress(t)
    let a = 0
    for (const [index, point] of points.entries()) {
      if (point.input <= x)
        a = index
    }
    if (a === points.length - 1)
      a -= 1
    const from = points[a]!
    const to = points[a + 1]!
    if (from.input === to.input)
      return to.output
    return from.output + (x - from.input) / (to.input - from.input) * (to.output - from.output)
  }
}

/** 按 CSS 缓动函数的语法解释一段文本，认不出返回 null。关键字与函数名不分大小写。 */
function parseCssEasing(text: string): EasingFunction | null {
  const value = text.trim().toLowerCase()
  if (value === 'linear')
    return IDENTITY
  const keyword = CSS_BEZIER_KEYWORDS.get(value)
  if (keyword !== undefined)
    return cubicBezier(keyword[0], keyword[1], keyword[2], keyword[3])
  if (value === 'step-start')
    return stepsEasing(1, 'jump-start')
  if (value === 'step-end')
    return stepsEasing(1, 'jump-end')

  const call = /^([a-z-]+)\(([^()]*)\)$/.exec(value)
  if (call === null)
    return null
  const args = call[2]!.split(',').map(arg => arg.trim())
  switch (call[1]) {
    case 'cubic-bezier':
      return parseCubicBezierArgs(args)
    case 'steps':
      return parseStepsArgs(args)
    case 'linear':
      return parseLinearArgs(args)
    default:
      return null
  }
}

const cache = new Map<string, EasingFunction>()

/**
 * 把缓动的几种写法统一成函数：命名缓动、CSS 缓动函数串、或函数本身；缺省为线性。
 *
 * CSS 串按 CSS 缓动函数的语法与取值解释：`linear`、`ease` / `ease-in` / `ease-out` / `ease-in-out`、
 * `step-start` / `step-end`、`cubic-bezier()`、`steps()`、`linear()`，写法不合 CSS 的一律不认。
 * 写法可能来自 DOM 特性、元素的计算样式或配置，认不出时抛 TypeError：
 * 拼错的名字若悄悄按匀速播放，比报错更难察觉。
 */
export function resolveEasing(value: EasingName | EasingFunction | string | undefined): EasingFunction {
  if (typeof value === 'function')
    return value
  if (value === undefined)
    return IDENTITY
  if (typeof value !== 'string')
    throw new TypeError(`[resolveEasing] 缓动须是名字、CSS 缓动函数串或函数，拿到的是 ${String(value)}`)

  const text = Object.hasOwn(easing, value) ? easing[value as EasingName] : value
  const cached = cache.get(text)
  if (cached !== undefined)
    return cached

  const fn = parseCssEasing(text)
  if (fn === null) {
    throw new TypeError(`[resolveEasing] 认不出缓动写法「${text}」。可用：命名缓动 ${Object.keys(easing).join(' / ')}，`
      + `或 CSS 缓动函数 linear / ease / ease-in / ease-out / ease-in-out / step-start / step-end / cubic-bezier() / steps() / linear()`)
  }
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
