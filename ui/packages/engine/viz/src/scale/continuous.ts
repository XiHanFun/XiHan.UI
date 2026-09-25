/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 连续比例尺：linear、pow、sqrt、log、symlog，以及输出色阶位置的 sequential、diverging。都是「变换 + 分段线性插值」。

import type { NumberFormatSpec } from '../format/number'
import type { ContinuousScale, PositionScale } from './types'
import { isPresent } from '../array/statistics'
import { ticks as linearTicks, nice as niceExtent, tickStep } from '../array/ticks'
import { invalidArgument, VizError } from '../errors'
import { createNumberFormat, tickFormat as stepFormat } from '../format/number'

export interface ContinuousScaleOptions {
  /** 缺省 [0, 1]；可以分段，但必须严格单调，长度与值域相同。 */
  readonly domain?: readonly number[]
  /** 缺省 [0, 1]。 */
  readonly range?: readonly number[]
  /** 钳制：定义域外的值落到值域两端，反查时像素先钳到值域内。缺省 false。 */
  readonly clamp?: boolean
  /** 输出取整到整像素。缺省 false。 */
  readonly round?: boolean
}

export interface PowScaleOptions extends ContinuousScaleOptions {
  /** 指数，必须大于 0；缺省 1。 */
  readonly exponent?: number
}

export interface LogScaleOptions extends ContinuousScaleOptions {
  /** 底数，必须大于 0 且不为 1；缺省 10。 */
  readonly base?: number
}

export interface SymlogScaleOptions extends ContinuousScaleOptions {
  /** `sign(x) · log1p(|x| / c)` 中的 c，必须大于 0；缺省 1。 */
  readonly constant?: number
}

/** 色阶位置比例尺的定义域变换。 */
export type PositionTransform = 'linear' | 'sqrt' | 'log' | 'symlog'

export interface SequentialScaleOptions {
  /** [小, 大]，缺省 [0, 1]。 */
  readonly domain?: readonly number[]
  readonly transform?: PositionTransform
}

export interface DivergingScaleOptions {
  /** [低, 中点, 高]，缺省 [−1, 0, 1]。 */
  readonly domain?: readonly number[]
  readonly transform?: PositionTransform
}

interface Transform {
  readonly forward: (x: number) => number
  readonly inverse: (y: number) => number
}

/** 刻度、刻度格式与取整：log 与其余变换各一套。 */
interface TickBehaviour {
  readonly ticks: (domain: readonly number[], count: number) => number[]
  readonly tickFormat: (domain: readonly number[], count: number, locale: string, spec: NumberFormatSpec) => (value: number) => string
  readonly nice: (domain: readonly number[], count: number) => number[]
}

const IDENTITY: Transform = { forward: x => x, inverse: y => y }

function first(values: readonly number[]): number {
  return values[0] as number
}

function last(values: readonly number[]): number {
  return values[values.length - 1] as number
}

function checkNumbers(name: string, values: readonly number[]): void {
  if (values.length < 2)
    throw invalidArgument(`${name} 至少要有两个值`, { [name]: values })
  for (const value of values) {
    if (!Number.isFinite(value))
      throw invalidArgument(`${name} 必须全是有限数`, { [name]: values })
  }
}

/** 严格单调方向：1 递增，−1 递减；两端相等的两元素表返回 0；不单调返回 NaN。 */
function direction(values: readonly number[]): number {
  if (values.length === 2 && first(values) === last(values))
    return 0
  const sign = Math.sign(last(values) - first(values))
  for (let i = 1; i < values.length; i++) {
    if (Math.sign((values[i] as number) - (values[i - 1] as number)) !== sign || sign === 0)
      return Number.NaN
  }
  return sign
}

/** 升序表里 t 所在的段：最大的 i ∈ [0, n − 2] 使 sorted[i] ≤ t。 */
function segment(sorted: readonly number[], t: number): number {
  let low = 1
  let high = sorted.length - 1
  while (low < high) {
    const mid = (low + high) >>> 1
    if ((sorted[mid] as number) <= t)
      low = mid + 1
    else
      high = mid
  }
  return low - 1
}

/** 把 (x[], y[]) 两张对应表按 x 升序排好，便于二分。 */
function ascendingPairs(xs: readonly number[], ys: readonly number[]): [number[], number[]] {
  return last(xs) >= first(xs) ? [xs.slice(), ys.slice()] : [xs.slice().reverse(), ys.slice().reverse()]
}

function interpolateSegment(xs: readonly number[], ys: readonly number[], x: number): number {
  const i = segment(xs, x)
  const x0 = xs[i] as number
  const x1 = xs[i + 1] as number
  const y0 = ys[i] as number
  const y1 = ys[i + 1] as number
  return x1 === x0 ? (y0 + y1) / 2 : y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
}

interface ContinuousConfig {
  readonly kind: ContinuousScale['kind']
  readonly transform: Transform
  readonly behaviour: TickBehaviour
  readonly domain: readonly number[]
  readonly range: readonly number[]
  readonly clamp: boolean
  readonly round: boolean
}

function createContinuous(config: ContinuousConfig): ContinuousScale {
  const { kind, transform, behaviour, clamp, round } = config
  const domain = Object.freeze(config.domain.slice())
  const range = Object.freeze(config.range.slice())
  checkNumbers('domain', domain)
  checkNumbers('range', range)
  if (domain.length !== range.length)
    throw invalidArgument('domain 与 range 的长度必须相同', { domain, range })
  if (Number.isNaN(direction(domain)))
    throw invalidArgument('domain 必须严格单调', { domain })

  const low = Math.min(first(domain), last(domain))
  const high = Math.max(first(domain), last(domain))
  const [forwardDomain, forwardRange] = ascendingPairs(domain.map(transform.forward), range)

  let inverseTables: [number[], number[]] | undefined
  const inverseTablesOf = (): [number[], number[]] => {
    if (!inverseTables) {
      if (!(Math.abs(direction(range)) === 1))
        throw invalidArgument('range 不严格单调，无法反查', { range })
      inverseTables = ascendingPairs(range, domain.map(transform.forward))
    }
    return inverseTables
  }

  const scale: ContinuousScale = {
    kind,
    domain,
    range,
    clamp,
    map(value: number): number | undefined {
      if (!isPresent(value))
        return undefined
      const x = clamp ? Math.min(high, Math.max(low, value)) : value
      const y = interpolateSegment(forwardDomain, forwardRange, transform.forward(x))
      if (Number.isNaN(y))
        return undefined
      return round ? Math.round(y) : y
    },
    invert(pixel: number): number {
      if (!Number.isFinite(pixel))
        throw invalidArgument('反查的像素必须是有限数', { pixel })
      const [pixels, values] = inverseTablesOf()
      const p = clamp ? Math.min(last(pixels), Math.max(first(pixels), pixel)) : pixel
      return transform.inverse(interpolateSegment(pixels, values, p))
    },
    ticks: (count = 10) => behaviour.ticks(domain, count),
    tickFormat: (locale: string, count = 10, spec: NumberFormatSpec = {}) => behaviour.tickFormat(domain, count, locale, spec),
    nice: (count = 10) => createContinuous({ ...config, domain: behaviour.nice(domain, count) }),
  }
  return Object.freeze(scale)
}

/** 线性刻度：按定义域两端取；nice 只动两端，分段的中间点不变。 */
const LINEAR_TICKS: TickBehaviour = {
  ticks: (domain, count) => linearTicks(first(domain), last(domain), count),
  tickFormat: (domain, count, locale, spec) => stepFormat(tickStep(first(domain), last(domain), count), locale, spec),
  nice(domain, count) {
    const [a, b] = niceExtent(first(domain), last(domain), count)
    return [a, ...domain.slice(1, -1), b]
  },
}

/** 线性比例尺。 */
export function scaleLinear(options: ContinuousScaleOptions = {}): ContinuousScale {
  return createContinuous({
    kind: 'linear',
    transform: IDENTITY,
    behaviour: LINEAR_TICKS,
    domain: options.domain ?? [0, 1],
    range: options.range ?? [0, 1],
    clamp: options.clamp ?? false,
    round: options.round ?? false,
  })
}

function powTransform(exponent: number): Transform {
  if (!(exponent > 0) || !Number.isFinite(exponent))
    throw invalidArgument('幂比例尺的指数必须是正的有限数', { exponent })
  if (exponent === 1)
    return IDENTITY
  return {
    forward: x => (x < 0 ? -((-x) ** exponent) : x ** exponent),
    inverse: y => (y < 0 ? -((-y) ** (1 / exponent)) : y ** (1 / exponent)),
  }
}

/** 幂比例尺：`sign(x) · |x|^exponent`。 */
export function scalePow(options: PowScaleOptions = {}): ContinuousScale {
  return createContinuous({
    kind: 'pow',
    transform: powTransform(options.exponent ?? 1),
    behaviour: LINEAR_TICKS,
    domain: options.domain ?? [0, 1],
    range: options.range ?? [0, 1],
    clamp: options.clamp ?? false,
    round: options.round ?? false,
  })
}

/** 平方根比例尺。气泡半径必须用它，面积才与数值成正比。 */
export function scaleSqrt(options: ContinuousScaleOptions = {}): ContinuousScale {
  return createContinuous({
    kind: 'sqrt',
    transform: powTransform(0.5),
    behaviour: LINEAR_TICKS,
    domain: options.domain ?? [0, 1],
    range: options.range ?? [0, 1],
    clamp: options.clamp ?? false,
    round: options.round ?? false,
  })
}

/** base 的整数次幂；负指数用除法，10 的负整数次幂得到精确的 0.01 而不是 0.010000000000000002。 */
function power(base: number, exponent: number): number {
  return Number.isInteger(exponent) && exponent < 0 ? 1 / base ** -exponent : base ** exponent
}

function logTransform(base: number, negative: boolean): Transform {
  const log = base === 10 ? Math.log10 : base === 2 ? Math.log2 : (x: number) => Math.log(x) / Math.log(base)
  return negative
    ? { forward: x => -log(-x), inverse: y => -power(base, -y) }
    : { forward: x => log(x), inverse: y => power(base, y) }
}

/** 不大于 x 的最大整数 p，使 base^p ≤ x（x > 0）；校正对数的浮点误差。 */
function floorExponent(x: number, base: number): number {
  let p = Math.floor(Math.log(x) / Math.log(base))
  if (power(base, p + 1) <= x)
    p++
  if (power(base, p) > x)
    p--
  return p
}

/** 不小于 x 的最小整数 p，使 base^p ≥ x（x > 0）。 */
function ceilExponent(x: number, base: number): number {
  let p = Math.ceil(Math.log(x) / Math.log(base))
  if (power(base, p - 1) >= x)
    p--
  if (power(base, p) < x)
    p++
  return p
}

/** 正区间 [u, v] 上的对数刻度（升序）。 */
function positiveLogTicks(u: number, v: number, count: number, base: number): number[] {
  const i = floorExponent(u, base)
  const j = ceilExponent(v, base)
  const decades = Math.log(v / u) / Math.log(base)
  if (base === 10 && decades < 3) {
    // 跨度不足 3 个数量级时补 2、5 倍刻度；刻度过多先去掉 2 倍，再去掉 5 倍
    for (const multipliers of [[1, 2, 5], [1, 5], [1]]) {
      const out: number[] = []
      for (let p = i; p <= j; p++) {
        for (const m of multipliers) {
          const t = p < 0 ? m / 10 ** -p : m * 10 ** p
          if (t >= u && t <= v)
            out.push(t)
        }
      }
      if (out.length < 2)
        return linearTicks(u, v, count)
      if (out.length <= Math.max(count, 2) || multipliers.length === 1)
        return out
    }
  }
  const every = Math.max(1, Math.ceil((j - i) / Math.max(1, count)))
  const out: number[] = []
  for (let p = Math.ceil(i / every) * every; p <= j; p += every) {
    const t = power(base, p)
    if (t >= u && t <= v)
      out.push(t)
  }
  return out.length < 2 ? linearTicks(u, v, count) : out
}

function logBehaviour(base: number): TickBehaviour {
  return {
    ticks(domain, count) {
      if (!(count > 0))
        return []
      const a = first(domain)
      const b = last(domain)
      const negative = a < 0
      const [u, v] = negative ? [Math.min(-a, -b), Math.max(-a, -b)] : [Math.min(a, b), Math.max(a, b)]
      let out = positiveLogTicks(u, v, count, base)
      if (negative)
        out = out.map(t => -t).reverse()
      return b < a ? out.reverse() : out
    },
    tickFormat: (_domain, _count, locale, spec) => createNumberFormat(locale, { precision: { type: 'significant', digits: 12 }, ...spec }),
    nice(domain) {
      const a = first(domain)
      const b = last(domain)
      const negative = a < 0
      const up = (x: number): number => (negative ? -power(base, floorExponent(-x, base)) : power(base, ceilExponent(x, base)))
      const down = (x: number): number => (negative ? -power(base, ceilExponent(-x, base)) : power(base, floorExponent(x, base)))
      return b >= a ? [down(a), ...domain.slice(1, -1), up(b)] : [up(a), ...domain.slice(1, -1), down(b)]
    },
  }
}

function checkLogDomain(domain: readonly number[]): boolean {
  const positive = domain.every(x => x > 0)
  const negative = domain.every(x => x < 0)
  if (!positive && !negative)
    throw new VizError('XH_VIZ_LOG_DOMAIN', '对数比例尺的定义域必须同号且不含 0', { domain })
  return negative
}

/** 对数比例尺。定义域含 0 或跨越正负时抛 `XH_VIZ_LOG_DOMAIN`。 */
export function scaleLog(options: LogScaleOptions = {}): ContinuousScale {
  const base = options.base ?? 10
  if (!(base > 0) || base === 1 || !Number.isFinite(base))
    throw invalidArgument('对数底数必须是大于 0 且不为 1 的有限数', { base })
  const domain = options.domain ?? [1, 10]
  const negative = checkLogDomain(domain)
  return createContinuous({
    kind: 'log',
    transform: logTransform(base, negative),
    behaviour: logBehaviour(base),
    domain,
    range: options.range ?? [0, 1],
    clamp: options.clamp ?? false,
    round: options.round ?? false,
  })
}

function symlogTransform(constant: number): Transform {
  if (!(constant > 0) || !Number.isFinite(constant))
    throw invalidArgument('symlog 的常数必须是正的有限数', { constant })
  return {
    forward: x => Math.sign(x) * Math.log1p(Math.abs(x) / constant),
    inverse: y => Math.sign(y) * Math.expm1(Math.abs(y)) * constant,
  }
}

/** 对称对数比例尺：`sign(x) · log1p(|x| / c)`，可以跨 0，适合跨 0 的长尾数据。 */
export function scaleSymlog(options: SymlogScaleOptions = {}): ContinuousScale {
  return createContinuous({
    kind: 'symlog',
    transform: symlogTransform(options.constant ?? 1),
    behaviour: LINEAR_TICKS,
    domain: options.domain ?? [0, 1],
    range: options.range ?? [0, 1],
    clamp: options.clamp ?? false,
    round: options.round ?? false,
  })
}

function positionParts(transform: PositionTransform, domain: readonly number[]): Pick<ContinuousConfig, 'transform' | 'behaviour'> {
  switch (transform) {
    case 'linear':
      return { transform: IDENTITY, behaviour: LINEAR_TICKS }
    case 'sqrt':
      return { transform: powTransform(0.5), behaviour: LINEAR_TICKS }
    case 'symlog':
      return { transform: symlogTransform(1), behaviour: LINEAR_TICKS }
    case 'log':
      return { transform: logTransform(10, checkLogDomain(domain)), behaviour: logBehaviour(10) }
    default:
      throw invalidArgument('未知的色阶变换', { transform })
  }
}

/** 顺序色阶位置：定义域 [小, 大] → t ∈ [0, 1]，始终钳制。 */
export function scaleSequential(options: SequentialScaleOptions = {}): PositionScale {
  const domain = options.domain ?? [0, 1]
  if (domain.length !== 2)
    throw invalidArgument('顺序色阶的定义域必须是 [小, 大] 两个值', { domain })
  return createContinuous({
    kind: 'sequential',
    ...positionParts(options.transform ?? 'linear', domain),
    domain,
    range: [0, 1],
    clamp: true,
    round: false,
  }) as PositionScale
}

/** 发散色阶位置：定义域 [低, 中点, 高] → t ∈ [0, 1]，中点落在 0.5，两臂各自线性，始终钳制。 */
export function scaleDiverging(options: DivergingScaleOptions = {}): PositionScale {
  const domain = options.domain ?? [-1, 0, 1]
  if (domain.length !== 3)
    throw invalidArgument('发散色阶的定义域必须是 [低, 中点, 高] 三个值', { domain })
  return createContinuous({
    kind: 'diverging',
    ...positionParts(options.transform ?? 'linear', domain),
    domain,
    range: [0, 0.5, 1],
    clamp: true,
    round: false,
  }) as PositionScale
}
