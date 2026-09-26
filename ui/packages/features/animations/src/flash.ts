/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 闪烁计数：WCAG 2.3.1 要求任意一秒内明暗交替不超过三次。
// 零依赖、只用可擦除的类型写法：门禁脚本直接导入这份源码，数皮肤里的 CSS 关键帧，
// 与动画层的入口校验用的是同一套数法。

/** 任意一秒内允许的闪烁次数上限（WCAG 2.3.1）。 */
export const MAX_FLASHES_PER_SECOND = 3

/**
 * 不透明度朝一个方向连续变化至少这么多，才算一次明暗起落；一明一暗两次起落算一次闪烁。
 * 取 WCAG 对一般闪烁的相对亮度门槛 10%，以不透明度近似。
 */
export const FLASH_DELTA = 0.1

/** 参与计数的一帧：位置与不透明度；没写不透明度的帧按 1 算。 */
export interface FlashFrame {
  offset?: number
  opacity?: number
}

/** 一段动画的时序：时长毫秒、播放次数（可为 Infinity）、播放方向。 */
export interface FlashTiming {
  duration: number
  iterations?: number
  direction?: string
}

/** 按宿主的规则补齐各帧偏移：首帧缺省 0、末帧缺省 1，中间缺的在两侧已知偏移之间等分。 */
export function computedOffsets(frames: readonly FlashFrame[]): number[] {
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
function isReversed(direction: string | undefined, iteration: number): boolean {
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
 * 无限次播放按周期取足一秒外加两个周期的样本。没有不透明度变化、或时长为 0 画不出中间帧时为 0。
 */
export function peakFlashes(frames: readonly FlashFrame[], timing: FlashTiming): number {
  if (!frames.some(frame => frame.opacity !== undefined))
    return 0
  const { duration } = timing
  if (!(duration > 0))
    return 0
  const iterations = timing.iterations ?? 1
  const sampled = Math.min(iterations, Math.ceil(1000 / duration) + 2)
  const offsets = computedOffsets(frames)
  const values = frames.map(frame => frame.opacity ?? 1)

  const points: Array<{ time: number, value: number }> = []
  for (let k = 0; k < Math.ceil(sampled); k++) {
    const reversed = isReversed(timing.direction, k)
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
