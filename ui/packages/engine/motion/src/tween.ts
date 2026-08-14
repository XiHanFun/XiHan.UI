// 数值补间的纯函数：给起点、终点、时长与缓动，算出"走了这么多毫秒之后是多少"。
// 不碰 DOM、不持有计时器——推进由调用方逐帧喂 elapsed。

/** 缓动档位。 */
export type TweenEasing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'

export interface TweenSpec {
  /** 起点值。 */
  from: number
  /** 终点值。 */
  to: number
  /** 总时长毫秒；<=0 或非有限数表示一步到位。 */
  duration: number
  /** 缓动，缺省 linear。 */
  easing?: TweenEasing
}

/** 各档缓动曲线，入参与出参都在 [0,1]，两端严格取到 0 与 1。 */
export const tweenEasings: Readonly<Record<TweenEasing, (t: number) => number>> = {
  'linear': t => t,
  'ease-in': t => t * t * t,
  'ease-out': t => 1 - (1 - t) ** 3,
  'ease-in-out': t => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2),
}

/** 取缓动曲线。认不出的档位退回 linear：档位可能来自 DOM 特性，那是一个任意字符串。 */
export function resolveTweenEasing(easing: TweenEasing | undefined): (t: number) => number {
  return tweenEasings[easing as TweenEasing] ?? tweenEasings.linear
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
  return from + (to - from) * resolveTweenEasing(spec.easing)(progress)
}
