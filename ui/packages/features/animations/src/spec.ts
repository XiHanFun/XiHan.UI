/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 配方的入口校验与换算：不合法的配方直接报错，合法的摊成 Web Animations 的关键帧。

import type { MotionFrame, MotionSpec } from './types'
import { easing, motionDurations, resolveEasing } from '@xihan-ui/motion'

/** 时长缺省毫秒：一段整幅位移的时长。 */
export const DEFAULT_DURATION: number = motionDurations.slide
/** 单段配方的帧数上限。 */
export const MAX_FRAMES = 60
/** 时长与起播延迟的上限毫秒。 */
export const MAX_DURATION = 60_000
/** 有限播放次数的上限。 */
export const MAX_ITERATIONS = 1000
/** 任意一秒内允许的闪烁次数上限（WCAG 2.3.1）。 */
export const MAX_FLASHES_PER_SECOND = 3

/**
 * 不透明度朝一个方向连续变化至少这么多，才算一次明暗起落；一明一暗两次起落算一次闪烁。
 * 取 WCAG 对一般闪烁的相对亮度门槛 10%，以不透明度近似。
 */
const FLASH_DELTA = 0.1

const FILL_MODES: ReadonlySet<string> = new Set(['none', 'forwards', 'backwards', 'both', 'auto'])
const DIRECTIONS: ReadonlySet<string> = new Set(['normal', 'reverse', 'alternate', 'alternate-reverse'])

function fail(message: string): never {
  throw new RangeError(`[animations] ${message}`)
}

function checkRange(value: number | undefined, name: string, min: number, max: number): void {
  if (value === undefined)
    return
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max)
    fail(`${name} 必须是 ${min} 到 ${max} 之间的有限数，收到 ${String(value)}`)
}

function checkAtLeast(value: number | undefined, name: string, min: number): void {
  if (value === undefined)
    return
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min)
    fail(`${name} 必须是不小于 ${min} 的有限数，收到 ${String(value)}`)
}

function checkFinite(value: number | undefined, name: string): void {
  if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value)))
    fail(`${name} 必须是有限数，收到 ${String(value)}`)
}

function checkLength(value: number | string | undefined, name: string): void {
  if (value === undefined)
    return
  if (typeof value === 'string') {
    if (value.trim() === '')
      fail(`${name} 不能是空串`)
    return
  }
  checkFinite(value, name)
}

function checkEasing(value: string, name: string): void {
  try {
    resolveEasing(value)
  }
  catch (error) {
    throw new TypeError(`[animations] ${name}：${(error as Error).message}`)
  }
}

/** 按宿主的规则补齐各帧偏移：首帧缺省 0、末帧缺省 1，中间缺的在两侧已知偏移之间等分。 */
function computedOffsets(frames: readonly MotionFrame[]): number[] {
  const out = frames.map(frame => frame.offset)
  if (out.length === 1)
    return [out[0] ?? 1]
  out[0] ??= 0
  out[out.length - 1] ??= 1
  let index = 1
  while (index < out.length - 1) {
    if (out[index] !== undefined) {
      index++
      continue
    }
    const start = index - 1
    let end = index
    while (out[end] === undefined)
      end++
    const from = out[start]!
    const span = out[end]! - from
    for (let k = index; k < end; k++)
      out[k] = from + (span * (k - start)) / (end - start)
    index = end
  }
  return out as number[]
}

/** 第 k 次播放是否倒着走。 */
function isReversed(direction: PlaybackDirection | undefined, iteration: number): boolean {
  if (direction === 'reverse')
    return true
  if (direction === 'alternate')
    return iteration % 2 === 1
  if (direction === 'alternate-reverse')
    return iteration % 2 === 0
  return false
}

/**
 * 任意一秒内最多闪几次。
 *
 * 把每次播放的不透明度按时间首尾相接成一条折线（前一次的末帧跳回下一次的首帧也算一段变化），
 * 朝同一方向连续变化满 FLASH_DELTA 的一段记一次起落、时刻取这段的终点；一秒窗口里的起落数折半即闪烁数。
 * 无限次播放按周期取足一秒外加两个周期的样本。时长为 0 的配方画不出中间帧，不算闪烁。
 */
export function peakFlashesPerSecond(spec: MotionSpec): number {
  const { frames } = spec
  if (!frames.some(frame => frame.opacity !== undefined))
    return 0
  const duration = spec.duration ?? DEFAULT_DURATION
  if (duration <= 0)
    return 0
  const iterations = spec.iterations ?? 1
  const sampled = Math.min(iterations, Math.ceil(1000 / duration) + 2)
  const offsets = computedOffsets(frames)
  const values = frames.map(frame => frame.opacity ?? 1)

  const points: Array<{ time: number, value: number }> = []
  for (let k = 0; k < Math.ceil(sampled); k++) {
    const reversed = isReversed(spec.direction, k)
    const order = reversed ? [...values.keys()].reverse() : [...values.keys()]
    for (const j of order) {
      const time = (k + (reversed ? 1 - offsets[j]! : offsets[j]!)) * duration
      if (time <= sampled * duration)
        points.push({ time, value: values[j]! })
    }
  }

  const swings: number[] = []
  let start = 0
  let direction = 0
  const close = (end: number): void => {
    if (direction !== 0 && Math.abs(points[end]!.value - points[start]!.value) >= FLASH_DELTA)
      swings.push(points[end]!.time)
  }
  for (let i = 1; i < points.length; i++) {
    const step = Math.sign(points[i]!.value - points[i - 1]!.value)
    if (step === direction)
      continue
    close(i - 1)
    start = i - 1
    direction = step
  }
  close(points.length - 1)

  let peak = 0
  for (let i = 0; i < swings.length; i++) {
    let j = i
    while (j < swings.length && swings[j]! < swings[i]! + 1000)
      j++
    peak = Math.max(peak, j - i)
  }
  return Math.floor(peak / 2)
}

/**
 * 校验一份配方，不合法时抛错。
 *
 * 帧数、各帧取值、偏移顺序、时长、延迟、播放次数、留值方式、播放方向与缓动写法逐项核对；
 * 最后按 WCAG 2.3.1 核闪烁：任意一秒内明暗交替超过三次的配方不播。不钳制、不补值，
 * 越界的配方直接报错，调用方在入口就能看到。
 */
export function validateMotionSpec(spec: MotionSpec): void {
  if (!Array.isArray(spec.frames) || spec.frames.length === 0)
    fail('frames 至少要有一帧')
  if (spec.frames.length > MAX_FRAMES)
    fail(`frames 最多 ${MAX_FRAMES} 帧，收到 ${spec.frames.length} 帧`)

  let previous = 0
  spec.frames.forEach((frame, index) => {
    const at = `frames[${index}]`
    if (frame.offset !== undefined) {
      checkRange(frame.offset, `${at}.offset`, 0, 1)
      if (frame.offset < previous)
        fail(`${at}.offset 比前面的帧小：偏移量必须按帧序不减`)
      previous = frame.offset
    }
    checkRange(frame.opacity, `${at}.opacity`, 0, 1)
    checkAtLeast(frame.scale, `${at}.scale`, 0)
    checkAtLeast(frame.blur, `${at}.blur`, 0)
    checkFinite(frame.rotate, `${at}.rotate`)
    checkLength(frame.x, `${at}.x`)
    checkLength(frame.y, `${at}.y`)
    if (frame.easing !== undefined)
      checkEasing(frame.easing, `${at}.easing`)
  })

  checkRange(spec.duration, 'duration', 0, MAX_DURATION)
  checkRange(spec.delay, 'delay', 0, MAX_DURATION)
  if (spec.iterations !== Number.POSITIVE_INFINITY)
    checkRange(spec.iterations, 'iterations', 0, MAX_ITERATIONS)
  if (spec.easing !== undefined)
    checkEasing(spec.easing, 'easing')
  if (spec.fill !== undefined && !FILL_MODES.has(spec.fill))
    fail(`fill 只能是 ${[...FILL_MODES].join(' / ')}，收到 ${String(spec.fill)}`)
  if (spec.direction !== undefined && !DIRECTIONS.has(spec.direction))
    fail(`direction 只能是 ${[...DIRECTIONS].join(' / ')}，收到 ${String(spec.direction)}`)

  const flashes = peakFlashesPerSecond(spec)
  if (flashes > MAX_FLASHES_PER_SECOND)
    fail(`任意一秒内闪烁 ${flashes} 次，超过 ${MAX_FLASHES_PER_SECOND} 次的上限（WCAG 2.3.1）：拉长时长、减少明暗起落或减少播放次数`)
}

/** 把一段配方倒过来播：帧序反转，偏移量镜像。 */
export function reverseSpec(spec: MotionSpec): MotionSpec {
  const frames = [...spec.frames].reverse().map((frame) => {
    const out = { ...frame }
    if (frame.offset !== undefined)
      out.offset = 1 - frame.offset
    // 缓动挂在"本帧到下一帧"上，反转后它描述的区间换了主人，一律丢弃
    delete out.easing
    return out
  })
  return { ...spec, frames }
}

function length(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}

/** 缓动名换成宿主认的 CSS 写法；CSS 缓动串原样返回。 */
function cssEasing(value: string): string {
  return Object.hasOwn(easing, value) ? easing[value as keyof typeof easing] : value
}

/** 位移的符号是否要跟着书写方向翻转。 */
function isRtl(element: HTMLElement): boolean {
  const view = element.ownerDocument?.defaultView
  if (typeof view?.getComputedStyle !== 'function')
    return false
  return view.getComputedStyle(element).direction === 'rtl'
}

function flip(value: number | string): number | string {
  if (typeof value === 'number')
    return -value
  return value.startsWith('-') ? value.slice(1) : `-${value}`
}

/**
 * 把视觉帧摊成宿主认的关键帧。
 *
 * 某个属性只要有一帧声明过，其余帧就补上它的中性值——只在中间帧出现的属性，
 * 宿主会拿元素当前的计算值当端点，那个值随皮肤而变，同一段配方在不同皮肤下就不是同一个动画。
 * 逐帧缓动名换成 CSS 写法：宿主的关键帧只认 CSS 缓动串，`easeOut` 这类名字会被整段拒掉。
 */
export function toKeyframes(spec: MotionSpec, element?: HTMLElement): Keyframe[] {
  const { frames } = spec
  const mirror = spec.logical === true && element !== undefined && isRtl(element)

  const has = {
    opacity: frames.some(frame => frame.opacity !== undefined),
    translate: frames.some(frame => frame.x !== undefined || frame.y !== undefined),
    scale: frames.some(frame => frame.scale !== undefined),
    rotate: frames.some(frame => frame.rotate !== undefined),
    blur: frames.some(frame => frame.blur !== undefined),
  }

  return frames.map((frame) => {
    const out: Keyframe = {}
    if (frame.offset !== undefined)
      out.offset = frame.offset
    if (frame.easing !== undefined)
      out.easing = cssEasing(frame.easing)
    if (has.opacity)
      out.opacity = String(frame.opacity ?? 1)
    if (has.translate) {
      const raw = frame.x ?? 0
      const x = mirror ? flip(raw) : raw
      out.translate = `${length(x)} ${length(frame.y ?? 0)}`
    }
    if (has.scale)
      out.scale = String(frame.scale ?? 1)
    if (has.rotate)
      out.rotate = `${frame.rotate ?? 0}deg`
    if (has.blur)
      out.filter = `blur(${frame.blur ?? 0}px)`
    return out
  })
}
