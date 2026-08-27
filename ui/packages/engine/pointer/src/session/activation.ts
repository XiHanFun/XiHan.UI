// 激活约束：按下之后要走多远才算「开始拖」。
import type { DndDelta } from '../dnd/types'

/**
 * 默认激活距离（px）。
 *
 * 取 5：鼠标点击时的手抖通常在 1–2px 以内，5 能把「点一下」与「拖一下」分开；
 * 再大就会让短距离拖拽（相邻两项换位）先走一段空行程，手感发黏。
 */
export const DEFAULT_ACTIVATION_DISTANCE = 5

export interface ActivationConstraint {
  /**
   * 位移超过这么多像素才算拖动。
   * 给 0 表示按下即拖——滑块、取色区这类「点哪儿定位到哪儿」的部件要的就是 0。
   */
  distance?: number
}

/**
 * 这次位移够不够格开始拖。
 *
 * 用直线距离而不是分轴比较：斜着拖 4px+4px 的实际位移是 5.7px，分轴比较会判成没动。
 */
export function shouldActivate(delta: DndDelta, constraint?: ActivationConstraint): boolean {
  const distance = constraint?.distance ?? DEFAULT_ACTIVATION_DISTANCE
  if (distance <= 0)
    return true
  return Math.hypot(delta.x, delta.y) >= distance
}
