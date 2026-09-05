// 数值补间的纯函数：给起点、终点、时长与缓动，算出"走了这么多毫秒之后是多少"。
// 不碰 DOM、不持有计时器——推进由调用方逐帧喂 elapsed。
// 曲线不自带一份，一律经 resolveEasing 取，与 CSS 侧同名同值。

import type { EasingFunction, EasingName } from './easing'
import { resolveEasing } from './easing'

export interface TweenSpec {
  /** 起点值。 */
  from: number
  /** 终点值。 */
  to: number
  /** 总时长毫秒；<=0 或非有限数表示一步到位。 */
  duration: number
  /** 缓动：曲线名、`cubic-bezier(...)` / `linear` 串，或函数本身。缺省线性。 */
  easing?: EasingName | EasingFunction | string
}

/**
 * 走完的比例，落在 [0,1]。
 *
 * 时长非正或非有限即刻满格。elapsed 非有限也按满格：它只可能来自坏掉的时钟读数，
 * 按 0 处理会让补间永远停在起点，按满格至少能收在终点上。
 */
export function tweenProgress(elapsed: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0)
    return 1
  if (!Number.isFinite(elapsed))
    return 1
  if (elapsed <= 0)
    return 0
  return elapsed >= duration ? 1 : elapsed / duration
}

/** 补间是否已经走完。 */
export function isTweenDone(elapsed: number, duration: number): boolean {
  return tweenProgress(elapsed, duration) >= 1
}

/**
 * 补间当前值。
 *
 * 走完那一刻返回终点本身，而不是按曲线算出来的近似值：曲线在 1 处的浮点结果
 * 会让最后停在 999.9999997 上，定了小数位也照样露馅。
 * 起点或终点是非有限数时按终点算，终点也不是数时按 0：NaN 一路写进文本就是一个"NaN"。
 */
export function tweenValueAt(spec: TweenSpec, elapsed: number): number {
  const to = Number.isFinite(spec.to) ? spec.to : 0
  const from = Number.isFinite(spec.from) ? spec.from : to
  const progress = tweenProgress(elapsed, spec.duration)
  if (progress >= 1)
    return to
  return from + (to - from) * resolveEasing(spec.easing)(progress)
}
