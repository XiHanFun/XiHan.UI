/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 有状态弹簧：目标随时可改。改目标时以当前位移与当前速度为初始条件重新求解，位置与速度都不跳变，
// 手势松手的速度也由这里接进来。每一段运动都是时间的闭式解，按帧取值而不逐帧积分，
// 所以给定时刻就能算出任意一帧的值，与帧率无关。
//
// 减弱动效下不播放：to() 直接落到终态并以 'rest' 结算。判断按宿主元素的 data-motion 作用域，
// 与 CSS 读同一个答案。

import type { SpringPhysical, SpringPresetName } from './spring'
import { frameLoop, frameNow } from './frame'
import { resolveMotionPreference } from './reduced-motion'
import { springPresets } from './spring'

/** 一次 to() 的结局：落定，或被新的 to() / set() / stop() 打断。 */
export type SpringValueSettle = 'rest' | 'interrupted'

export interface SpringValueOptions {
  /** 弹簧参数：预设名或物理参数。 */
  spring: SpringPresetName | SpringPhysical
  /** 初始值。 */
  value: number
  /** 每帧写出当前值与速度（单位 / 秒）。 */
  onUpdate: (value: number, velocity: number) => void
  /** 宿主元素：取它所在的窗口驱动帧循环，并按它的 data-motion 作用域判断减弱动效。 */
  target: Element
  /** 静止判据：与目标的距离小于它、且速度小于它的 10 倍即视为落定。单位与 value 相同，缺省 0.01。 */
  precision?: number
}

export interface SpringValue {
  /** 最近一次写出的值。 */
  readonly value: number
  /** 最近一次写出的速度（单位 / 秒）。 */
  readonly velocity: number
  /** 当前目标。 */
  readonly target: number
  /** 是否在运动中。 */
  readonly animating: boolean
  /** 朝 target 运动；velocity 缺省沿用当前速度。 */
  to: (target: number, options?: { velocity?: number }) => Promise<SpringValueSettle>
  /** 立即落到 value，速度归零，打断进行中的运动。 */
  set: (value: number) => void
  /** 停在当前位置，速度归零，打断进行中的运动。 */
  stop: () => void
}

/** 一段运动：t 秒时相对目标的位移与速度。 */
interface Segment {
  displacement: (t: number) => number
  velocity: (t: number) => number
}

const CRITICAL_EPSILON = 1e-9

function fail(message: string): never {
  throw new TypeError(`[createSpringValue] ${message}`)
}

function finite(value: unknown, name: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value))
    fail(`${name} 必须是有限数值，拿到的是 ${String(value)}`)
  return value
}

function physicalOf(spring: SpringPresetName | SpringPhysical): SpringPhysical {
  if (typeof spring === 'string') {
    const preset = springPresets[spring]
    if (!preset)
      fail(`未知的弹簧预设 ${spring}，可用的有 ${Object.keys(springPresets).join('、')}`)
    return preset
  }
  const stiffness = finite(spring.stiffness, 'spring.stiffness')
  const damping = finite(spring.damping, 'spring.damping')
  const mass = finite(spring.mass, 'spring.mass')
  if (stiffness <= 0 || damping <= 0 || mass <= 0)
    fail(`刚度、阻尼与质量都必须大于 0，拿到的是 ${stiffness} / ${damping} / ${mass}`)
  return { stiffness, damping, mass }
}

/**
 * 阻尼振子 m·x'' + c·x' + k·x = 0 的闭式解，x 是相对目标的位移。
 * d0、v0 是起点的位移与速度；三种阻尼各一套公式，速度是位移的解析导数。
 */
export function solveSpring({ stiffness, damping, mass }: SpringPhysical, d0: number, v0: number): Segment {
  const omega = Math.sqrt(stiffness / mass)
  const zeta = damping / (2 * Math.sqrt(stiffness * mass))

  if (Math.abs(zeta - 1) < CRITICAL_EPSILON) {
    const b = v0 + omega * d0
    return {
      displacement: t => Math.exp(-omega * t) * (d0 + b * t),
      velocity: t => Math.exp(-omega * t) * (b - omega * (d0 + b * t)),
    }
  }
  if (zeta < 1) {
    const damped = omega * Math.sqrt(1 - zeta * zeta)
    const decay = zeta * omega
    const a = d0
    const b = (v0 + decay * d0) / damped
    return {
      displacement: t => Math.exp(-decay * t) * (a * Math.cos(damped * t) + b * Math.sin(damped * t)),
      velocity: t => Math.exp(-decay * t)
        * ((damped * b - decay * a) * Math.cos(damped * t) - (damped * a + decay * b) * Math.sin(damped * t)),
    }
  }
  const root = omega * Math.sqrt(zeta * zeta - 1)
  const r1 = -zeta * omega + root
  const r2 = -zeta * omega - root
  const c1 = (v0 - r2 * d0) / (r1 - r2)
  const c2 = d0 - c1
  return {
    displacement: t => c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t),
    velocity: t => c1 * r1 * Math.exp(r1 * t) + c2 * r2 * Math.exp(r2 * t),
  }
}

/** 构造一个有状态弹簧。 */
export function createSpringValue(options: SpringValueOptions): SpringValue {
  const physical = physicalOf(options.spring)
  const precision = options.precision === undefined ? 0.01 : finite(options.precision, 'precision')
  if (precision <= 0)
    fail(`precision 必须大于 0，拿到的是 ${precision}`)
  if (typeof options.onUpdate !== 'function')
    fail('onUpdate 必须是函数')
  const host = options.target
  const win = host?.ownerDocument?.defaultView
  if (!win)
    fail('target 必须是挂在文档里的元素，用来取窗口驱动帧循环')

  let value = finite(options.value, 'value')
  let velocity = 0
  let goal = value
  let segment: Segment | null = null
  let startedAt = 0
  let stopLoop: VoidFunction | null = null
  let settle: ((result: SpringValueSettle) => void) | null = null

  const emit = (): void => options.onUpdate(value, velocity)

  const finish = (result: SpringValueSettle): void => {
    stopLoop?.()
    stopLoop = null
    segment = null
    const resolve = settle
    settle = null
    resolve?.(result)
  }

  /** 按当前时刻把进行中的这段运动采样到 value / velocity。 */
  const sample = (): void => {
    if (!segment)
      return
    const t = (frameNow(win) - startedAt) / 1000
    value = goal + segment.displacement(t)
    velocity = segment.velocity(t)
  }

  const rested = (): boolean => Math.abs(value - goal) < precision && Math.abs(velocity) < precision * 10

  const tick = (): void => {
    sample()
    if (rested()) {
      value = goal
      velocity = 0
      emit()
      finish('rest')
      return
    }
    emit()
  }

  return {
    get value() {
      return value
    },
    get velocity() {
      return velocity
    },
    get target() {
      return goal
    },
    get animating() {
      return segment !== null
    },

    to(target, toOptions) {
      const next = finite(target, 'target')
      const startVelocity = toOptions?.velocity === undefined ? undefined : finite(toOptions.velocity, 'velocity')
      sample()
      if (settle) {
        const resolve = settle
        settle = null
        resolve('interrupted')
      }
      goal = next
      if (startVelocity !== undefined)
        velocity = startVelocity

      if (resolveMotionPreference(host) === 'reduce' || rested()) {
        stopLoop?.()
        stopLoop = null
        segment = null
        value = goal
        velocity = 0
        emit()
        return Promise.resolve('rest')
      }

      segment = solveSpring(physical, value - goal, velocity)
      startedAt = frameNow(win)
      stopLoop ??= frameLoop(win, tick)
      return new Promise((resolve) => {
        settle = resolve
      })
    },

    set(next) {
      value = finite(next, 'value')
      velocity = 0
      goal = value
      finish('interrupted')
      emit()
    },

    stop() {
      sample()
      velocity = 0
      goal = value
      finish('interrupted')
      emit()
    },
  }
}
