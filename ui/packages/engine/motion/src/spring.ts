// 弹簧：质量-刚度-阻尼模型的解析解。按时间直接求值，不逐帧积分，
// 因此可以任意采样、可离线烘焙成 CSS linear() 缓动串。

import { toLinearEasing } from './easing'

/** 物理参数。 */
export interface SpringPhysical {
  stiffness: number
  damping: number
  mass: number
}

/** 感知参数：duration 为期望沉降秒数，bounce 落在 (-1, 1)，正数弹、负数拖沓。 */
export interface SpringPerceptual {
  duration: number
  bounce: number
}

export type SpringPresetName = 'snappy' | 'smooth' | 'gentle' | 'bouncy' | 'stiff'

export type SpringSpec = SpringPhysical | SpringPerceptual | SpringPresetName

export interface SpringSolver {
  /** t 秒时的归一化位移，起点 0、终点 1，欠阻尼时可越过 1。 */
  (t: number): number
  /** 沉降到静止阈值所需的毫秒数。 */
  readonly durationMs: number
  /** 阻尼比：<1 欠阻尼，=1 临界阻尼，>1 过阻尼。 */
  readonly dampingRatio: number
  /** 最大过冲量，即超过 1 的部分；不过冲为 0。 */
  readonly overshoot: number
}

/** 视作静止的残差。 */
const REST = 1e-3
/** 沉降时长上限秒数，防止近零阻尼算出无穷长。 */
const MAX_SETTLE = 10
/** 求过冲时的采样点数。 */
const OVERSHOOT_SAMPLES = 256

export const springPresets: Readonly<Record<SpringPresetName, SpringPhysical>> = {
  snappy: { stiffness: 380, damping: 30, mass: 1 },
  smooth: { stiffness: 300, damping: 30, mass: 1 },
  gentle: { stiffness: 170, damping: 26, mass: 1 },
  bouncy: { stiffness: 400, damping: 18, mass: 1 },
  stiff: { stiffness: 600, damping: 42, mass: 1 },
}

function isPreset(spec: SpringSpec): spec is SpringPresetName {
  return typeof spec === 'string'
}

function isPerceptual(spec: SpringPhysical | SpringPerceptual): spec is SpringPerceptual {
  return 'bounce' in spec
}

/** 感知参数换算成物理参数：质量取 1，由 bounce 定阻尼比、由 duration 定固有频率。 */
export function springFromPerceptual(spec: SpringPerceptual): SpringPhysical {
  const duration = Number.isFinite(spec.duration) && spec.duration > 0 ? spec.duration : 0.5
  const bounce = Number.isFinite(spec.bounce) ? Math.min(0.99, Math.max(-0.99, spec.bounce)) : 0
  const ratio = bounce >= 0 ? 1 - bounce : 1 / (1 + bounce)
  const omega = bounce >= 0
    ? (2 * Math.PI) / duration
    : (2 * Math.PI) / (duration * (1 + bounce))
  return { mass: 1, stiffness: omega * omega, damping: 2 * ratio * omega }
}

function toPhysical(spec: SpringSpec): SpringPhysical {
  if (isPreset(spec))
    return springPresets[spec] ?? springPresets.smooth
  if (isPerceptual(spec))
    return springFromPerceptual(spec)
  return spec
}

/** 临界阻尼分支的沉降时刻：(a + b·t)·e^(−ωt) = REST，先倍增找上界再二分。 */
function settleCritical(a: number, b: number, omega: number): number {
  const magnitude = (t: number): number => (a + b * t) * Math.exp(-omega * t)
  let hi = 1 / omega
  while (hi < MAX_SETTLE && magnitude(hi) > REST) hi *= 2
  if (magnitude(hi) > REST)
    return MAX_SETTLE
  let lo = 0
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (magnitude(mid) > REST)
      lo = mid
    else hi = mid
  }
  return hi
}

/**
 * 构造弹簧求解器。
 *
 * initialVelocity 的单位是"归一化位移每秒"，正方向朝向终点，用于把手势松手时的速度接进来。
 */
export function createSpring(spec: SpringSpec, initialVelocity = 0): SpringSolver {
  const physical = toPhysical(spec)
  const mass = Number.isFinite(physical.mass) && physical.mass > 0 ? physical.mass : 1
  const stiffness = Number.isFinite(physical.stiffness) && physical.stiffness > 0 ? physical.stiffness : 0
  const damping = Number.isFinite(physical.damping) && physical.damping > 0 ? physical.damping : 0
  const velocity = Number.isFinite(initialVelocity) ? initialVelocity : 0

  if (stiffness === 0) {
    const instant = ((t: number) => (Number.isFinite(t) && t > 0 ? 1 : 0)) as {
      (t: number): number
      durationMs: number
      dampingRatio: number
      overshoot: number
    }
    instant.durationMs = 0
    instant.dampingRatio = Number.POSITIVE_INFINITY
    instant.overshoot = 0
    return instant as SpringSolver
  }

  const omega = Math.sqrt(stiffness / mass)
  const ratio = damping / (2 * Math.sqrt(stiffness * mass))

  let displacement: (t: number) => number
  let settle: number

  if (ratio < 1) {
    const damped = omega * Math.sqrt(1 - ratio * ratio)
    const c1 = -1
    const c2 = (velocity - ratio * omega) / damped
    displacement = t => Math.exp(-ratio * omega * t) * (c1 * Math.cos(damped * t) + c2 * Math.sin(damped * t))
    const amplitude = Math.hypot(c1, c2)
    settle = amplitude <= REST ? 0 : Math.log(amplitude / REST) / (ratio * omega)
  }
  else if (ratio === 1) {
    const c1 = -1
    const c2 = velocity - omega
    displacement = t => (c1 + c2 * t) * Math.exp(-omega * t)
    settle = settleCritical(Math.abs(c1), Math.abs(c2), omega)
  }
  else {
    const root = omega * Math.sqrt(ratio * ratio - 1)
    const slow = -omega * ratio + root
    const fast = -omega * ratio - root
    const c1 = (velocity + fast) / (slow - fast)
    const c2 = -1 - c1
    displacement = t => c1 * Math.exp(slow * t) + c2 * Math.exp(fast * t)
    const amplitude = Math.abs(c1) + Math.abs(c2)
    settle = amplitude <= REST ? 0 : Math.log(amplitude / REST) / -slow
  }

  if (!Number.isFinite(settle) || settle < 0)
    settle = MAX_SETTLE
  settle = Math.min(settle, MAX_SETTLE)

  const solver = ((t: number): number => {
    if (!Number.isFinite(t) || t <= 0)
      return 0
    if (t >= settle)
      return 1
    return 1 + displacement(t)
  }) as {
    (t: number): number
    durationMs: number
    dampingRatio: number
    overshoot: number
  }

  let peak = 0
  for (let i = 0; i <= OVERSHOOT_SAMPLES; i++) {
    const value = solver((settle * i) / OVERSHOOT_SAMPLES)
    if (value > peak)
      peak = value
  }

  solver.durationMs = settle * 1000
  solver.dampingRatio = ratio
  solver.overshoot = Math.max(0, peak - 1)
  return solver as SpringSolver
}

/** 把弹簧烘焙成 CSS `linear()` 缓动串，配合 `durationMs` 使用。 */
export function springToLinearEasing(solver: SpringSolver, samples = 32): string {
  const seconds = solver.durationMs / 1000
  return toLinearEasing(t => solver(t * seconds), samples)
}

/** 宿主是否支持 `linear()` 缓动。 */
export function supportsLinearEasing(): boolean {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function')
    return false
  return CSS.supports('animation-timing-function', 'linear(0, 1)')
}
