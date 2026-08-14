// 配方的归一化与换算：钳制越界值、把视觉帧摊成 Web Animations 的关键帧。

import type { MotionFrame, MotionSpec } from './types'

/** 时长缺省毫秒。 */
export const DEFAULT_DURATION = 320
/** 单段配方的帧数上限。 */
export const MAX_FRAMES = 60
/** 时长上限毫秒。 */
export const MAX_DURATION = 60_000

function clampNumber(value: number | undefined, min: number, max: number, fallback: number): number {
  if (value === undefined || !Number.isFinite(value))
    return fallback
  return Math.min(max, Math.max(min, value))
}

function clampLength(value: number | string | undefined): number | string | undefined {
  if (typeof value === 'string')
    return value
  if (value === undefined || !Number.isFinite(value))
    return undefined
  return value
}

/** 帧里的偏移量：越界或非有限一律丢弃，交给等分。 */
function clampOffset(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value) || value < 0 || value > 1)
    return undefined
  return value
}

function clampFrame(frame: MotionFrame): MotionFrame {
  const out: MotionFrame = {}
  const offset = clampOffset(frame.offset)
  if (offset !== undefined)
    out.offset = offset
  if (frame.opacity !== undefined && Number.isFinite(frame.opacity))
    out.opacity = Math.min(1, Math.max(0, frame.opacity))
  const x = clampLength(frame.x)
  if (x !== undefined)
    out.x = x
  const y = clampLength(frame.y)
  if (y !== undefined)
    out.y = y
  if (frame.scale !== undefined && Number.isFinite(frame.scale))
    out.scale = Math.max(0, frame.scale)
  if (frame.rotate !== undefined && Number.isFinite(frame.rotate))
    out.rotate = frame.rotate
  if (frame.blur !== undefined && Number.isFinite(frame.blur))
    out.blur = Math.max(0, frame.blur)
  if (typeof frame.easing === 'string')
    out.easing = frame.easing
  return out
}

/**
 * 钳制一份配方到可播放的范围。
 *
 * 帧数为零时补一帧空帧：空关键帧数组交给宿主会抛错，一段什么都不改的动画不会。
 */
export function clampSpec(spec: MotionSpec): MotionSpec {
  const frames = spec.frames.slice(0, MAX_FRAMES).map(frame => clampFrame(frame))
  const out: MotionSpec = {
    frames: frames.length > 0 ? frames : [{}],
    duration: clampNumber(spec.duration, 0, MAX_DURATION, DEFAULT_DURATION),
  }
  if (typeof spec.easing === 'string')
    out.easing = spec.easing
  if (spec.delay !== undefined)
    out.delay = clampNumber(spec.delay, 0, MAX_DURATION, 0)
  if (spec.fill !== undefined)
    out.fill = spec.fill
  if (spec.iterations !== undefined) {
    out.iterations = spec.iterations === Number.POSITIVE_INFINITY
      ? Number.POSITIVE_INFINITY
      : clampNumber(spec.iterations, 0, 1000, 1)
  }
  if (spec.direction !== undefined)
    out.direction = spec.direction
  if (spec.logical === true)
    out.logical = true
  return out
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
      out.easing = frame.easing
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
