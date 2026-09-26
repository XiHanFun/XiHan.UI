/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 配方的入口校验与换算：不合法的配方直接报错，合法的摊成 Web Animations 的关键帧。

import type { MotionSpec } from './types'
import { easing, motionDurations, resolveEasing } from '@xihan-ui/motion'
import { MAX_FLASHES_PER_SECOND, peakFlashes } from './flash'

export { MAX_FLASHES_PER_SECOND } from './flash'

/** 时长缺省毫秒：一段整幅位移的时长。 */
export const DEFAULT_DURATION: number = motionDurations.slide
/** 单段配方的帧数上限。 */
export const MAX_FRAMES = 60
/** 时长与起播延迟的上限毫秒。 */
export const MAX_DURATION = 60_000
/** 有限播放次数的上限。 */
export const MAX_ITERATIONS = 1000

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

/**
 * 任意一秒内最多闪几次：按配方的时长（缺省同播放器）、播放次数与方向，数法见 flash.ts。
 * 没有不透明度变化、或时长为 0 画不出中间帧时为 0。
 */
export function peakFlashesPerSecond(spec: MotionSpec): number {
  return peakFlashes(spec.frames, {
    duration: spec.duration ?? DEFAULT_DURATION,
    iterations: spec.iterations,
    direction: spec.direction,
  })
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
