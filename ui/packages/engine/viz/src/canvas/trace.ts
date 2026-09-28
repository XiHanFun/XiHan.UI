/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 类型化数组上的路径：坐标已是像素，按 NaN 断开成若干段，写进 PathSink（Canvas 2D 上下文本身就是一个）。
// 不为每个点建对象；降采样后的几千个点每帧重写一遍也只是一次遍历。

import type { PathSink } from '../path'

/** 阶梯的画法，与 shape 的 step / stepBefore / stepAfter 同义。 */
export type StepMode = 'step' | 'step-before' | 'step-after'

/** 下标 i 这一点是否有值。 */
function defined(xs: ArrayLike<number>, ys: ArrayLike<number>, i: number): boolean {
  return !Number.isNaN(xs[i] as number) && !Number.isNaN(ys[i] as number)
}

/** 从 from 起一段连续有值的点的结束下标（不含）。 */
function runEnd(xs: ArrayLike<number>, ys: ArrayLike<number>, from: number, count: number): number {
  let i = from
  while (i < count && defined(xs, ys, i))
    i++
  return i
}

/** 一段连续的点按曲线连起来：linear 直连，阶梯按 mode 先横后竖或先竖后横。 */
function traceRun(sink: PathSink, xs: ArrayLike<number>, ys: ArrayLike<number>, from: number, to: number, step: StepMode | null, reverse: boolean): void {
  const at = (k: number): number => (reverse ? to - 1 - (k - from) : k)
  for (let k = from; k < to; k++) {
    const i = at(k)
    const x = xs[i] as number
    const y = ys[i] as number
    if (k === from) {
      if (!reverse)
        sink.moveTo(x, y)
      else
        sink.lineTo(x, y)
      continue
    }
    if (step) {
      const p = at(k - 1)
      const px = xs[p] as number
      const py = ys[p] as number
      // 反向走（面积的回程）时阶梯的前后颠倒
      const mode = !reverse ? step : step === 'step-before' ? 'step-after' : step === 'step-after' ? 'step-before' : 'step'
      if (mode === 'step') {
        const mid = (px + x) / 2
        sink.lineTo(mid, py)
        sink.lineTo(mid, y)
      }
      else if (mode === 'step-before') {
        sink.lineTo(px, y)
      }
      else {
        sink.lineTo(x, py)
      }
    }
    sink.lineTo(x, y)
  }
}

/** 折线：NaN 处断开；step 给了时按阶梯连。 */
export function tracePolyline(sink: PathSink, xs: ArrayLike<number>, ys: ArrayLike<number>, count: number, step: StepMode | null = null): void {
  const n = Math.min(count, xs.length, ys.length)
  let i = 0
  while (i < n) {
    if (!defined(xs, ys, i)) {
      i++
      continue
    }
    const end = runEnd(xs, ys, i, n)
    traceRun(sink, xs, ys, i, end, step, false)
    i = end
  }
}

/**
 * 两条沿线之间的区域：上沿是 (xs, ys)，下沿是 (xs, base)——base 是数（面积的基线）或逐点的数组（区间带的下沿）。
 * 任一处为 NaN 就断开，每段各自闭合。
 */
export function traceBand(sink: PathSink, xs: ArrayLike<number>, ys: ArrayLike<number>, base: number | ArrayLike<number>, count: number, step: StepMode | null = null): void {
  const n = Math.min(count, xs.length, ys.length)
  const lower = typeof base === 'number' ? null : base
  const baseDefined = (i: number): boolean => !Number.isNaN(lower ? lower[i] as number : base as number)
  let i = 0
  while (i < n) {
    if (!defined(xs, ys, i) || !baseDefined(i)) {
      i++
      continue
    }
    let end = i
    while (end < n && defined(xs, ys, end) && baseDefined(end))
      end++
    traceRun(sink, xs, ys, i, end, step, false)
    if (lower) {
      traceRun(sink, xs, lower, i, end, step, true)
    }
    else {
      // 基线是一条水平线：从末点垂直落下，沿基线回到首点
      sink.lineTo(xs[end - 1] as number, base as number)
      sink.lineTo(xs[i] as number, base as number)
    }
    sink.closePath()
    i = end
  }
}
