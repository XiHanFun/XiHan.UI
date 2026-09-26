/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 手势松手的物理：越界跟手的橡皮筋衰减、松手落点投影与最近吸附点、惯性滑行的弹簧。纯函数，不持有状态、
// 不读 DOM；组件拿指针会话结束时的速度算落点，再交给有状态弹簧（createSpringValue）带着同一速度落过去。

import type { SpringPhysical } from './spring'

/**
 * 越界跟手：越出边界 overshoot（正负表示方向）时，跟手的位移按 `(1 − 1 / (|x| × 0.55 / d + 1)) × d`
 * 衰减，越拉越沉，趋近但到不了 d。d 是越界方向的尺寸（拇指 24px、卡片 60px、面板 80px 一类），
 * 不大于 0 时不许越界。
 */
export function rubberBand(overshoot: number, dimension: number): number {
  if (dimension <= 0 || overshoot === 0)
    return 0
  const reach = (1 - 1 / ((Math.abs(overshoot) * 0.55) / dimension + 1)) * dimension
  return Math.sign(overshoot) * reach
}

/** 把 value 收进 [min, max]；越出的部分不截断，按橡皮筋衰减跟手。min 大于 max 时按两者对调处理。 */
export function rubberClamp(value: number, min: number, max: number, dimension: number): number {
  const low = Math.min(min, max)
  const high = Math.max(min, max)
  if (value < low)
    return low + rubberBand(value - low, dimension)
  if (value > high)
    return high + rubberBand(value - high, dimension)
  return value
}

/**
 * 松手落点投影：当前位置顺着松手速度（单位 / 秒）再走 seconds 秒。投影时间越长，轻甩越容易越过吸附点；
 * 拇指这类短行程取 0.06s。
 */
export function projectRelease(position: number, velocity: number, seconds: number): number {
  return position + velocity * seconds
}

/** 离 position 最近的吸附点；等距时取前一个。没有吸附点时原样返回 position。 */
export function nearestSnap(points: readonly number[], position: number): number {
  let best = position
  let distance = Number.POSITIVE_INFINITY
  for (const point of points) {
    const next = Math.abs(point - position)
    if (next < distance) {
      distance = next
      best = point
    }
  }
  return best
}

/**
 * 惯性滑行：临界阻尼、固有频率 1 / seconds 的弹簧。从松手速度 v 出发、目标取投影落点（位置 + v × seconds）时，
 * 位移恰好按 e^(−t / seconds) 衰减——起步速度等于松手速度，一路减速停在投影落点，不会被弹簧往前甩。
 * 目标被边界截短时，同一支弹簧会在边界上轻碰一下再落定。
 */
export function glideSpring(seconds: number): SpringPhysical {
  const omega = 1 / seconds
  return { stiffness: omega * omega, damping: 2 * omega, mass: 1 }
}
