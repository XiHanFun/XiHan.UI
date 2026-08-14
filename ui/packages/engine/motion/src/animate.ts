// Web Animations 的薄封装：统一收口减弱动效降级、宿主缺失降级与结束时的结算方式。

import type { EasingName } from './easing'
import { easing } from './easing'
import { resolveMotionPreference } from './reduced-motion'

/** 动画的结束方式。被打断也照常结算，调用方不必接 rejection。 */
export type AnimationStatus = 'finished' | 'cancelled'

export interface AnimateOptions {
  /** 时长毫秒，缺省 200。 */
  duration?: number
  /** 缓动名或任意 CSS 缓动串，缺省 standard。 */
  easing?: EasingName | (string & {})
  /** 起播延迟毫秒。 */
  delay?: number
  /** 播完后的留值方式，缺省 none。 */
  fill?: FillMode
  /** 播放次数，缺省 1。 */
  iterations?: number
  direction?: PlaybackDirection
  composite?: CompositeOperation
}

export interface AnimationHandle {
  /** 结束时结算，值区分播完与被打断。 */
  readonly finished: Promise<AnimationStatus>
  /** 打断并回到未播状态。 */
  cancel: () => void
  /** 直接跳到终点。 */
  finish: () => void
}

const SETTLED: AnimationStatus = 'finished'

/** 非样式属性的关键帧字段。 */
const TIMING_KEYS = new Set(['offset', 'easing', 'composite'])

function resolveEasingString(value: AnimateOptions['easing']): string {
  if (value === undefined)
    return easing.standard
  return value in easing ? easing[value as EasingName] : value
}

/** 把关键帧里的样式写到元素上。 */
function applyKeyframe(element: HTMLElement, frame: Keyframe): void {
  for (const [key, value] of Object.entries(frame)) {
    if (TIMING_KEYS.has(key) || value === null || value === undefined)
      continue
    const text = String(value)
    if (key.startsWith('--'))
      element.style.setProperty(key, text)
    else element.style.setProperty(hyphenate(key), text)
  }
}

/** camelCase 属性名转 CSS 连字符写法；已是连字符写法的原样返回。 */
function hyphenate(key: string): string {
  return key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
}

function settled(status: AnimationStatus): AnimationHandle {
  return {
    finished: Promise.resolve(status),
    cancel: () => {},
    finish: () => {},
  }
}

/**
 * 播一段关键帧动画。
 *
 * 减弱动效偏好为 reduce、或宿主没有 `Element.animate` 时不产生中间帧：
 * 按 fill 决定是否把末帧样式落到元素上，`finished` 立即以 `'finished'` 结算。
 */
export function animate(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: AnimateOptions = {},
): AnimationHandle {
  const fill = options.fill ?? 'none'
  const reduced = resolveMotionPreference(element.ownerDocument?.defaultView ?? undefined) === 'reduce'

  if (reduced || typeof element.animate !== 'function') {
    const last = keyframes[keyframes.length - 1]
    if (last !== undefined && (fill === 'forwards' || fill === 'both'))
      applyKeyframe(element, last)
    return settled(SETTLED)
  }

  const animation = element.animate(keyframes, {
    duration: options.duration ?? 200,
    easing: resolveEasingString(options.easing),
    delay: options.delay ?? 0,
    iterations: options.iterations ?? 1,
    direction: options.direction ?? 'normal',
    composite: options.composite ?? 'replace',
    fill,
  })

  const finished = animation.finished
    .then<AnimationStatus>(() => 'finished')
    .catch<AnimationStatus>(() => 'cancelled')

  return {
    finished,
    cancel: () => animation.cancel(),
    finish: () => animation.finish(),
  }
}
