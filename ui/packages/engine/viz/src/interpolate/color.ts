/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 颜色插值：OKLab 线性插值与 OKLCH 最短色相路径。只用于构建期生成色阶、校验与 Canvas 渲染；SVG 运行时着色交给样式里的 color-mix。

import type { Rgba } from '../color/space'
import type { Interpolator } from './value'
import { fromOklab, fromOklch, toOklab, toOklch } from '../color/space'

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t))
}

/** 在 OKLab 里直线插值；t 钳到 [0, 1]。 */
export function interpolateOklab(a: Rgba, b: Rgba): Interpolator<Rgba> {
  const x = toOklab(a)
  const y = toOklab(b)
  return (t) => {
    const s = clamp01(t)
    return fromOklab({
      l: x.l + (y.l - x.l) * s,
      a: x.a + (y.a - x.a) * s,
      b: x.b + (y.b - x.b) * s,
      alpha: x.alpha + (y.alpha - x.alpha) * s,
    })
  }
}

/** 彩度低于它的颜色没有可靠的色相，插值时借用另一端的色相。 */
const ACHROMATIC = 1e-4

/** 在 OKLCH 里插值，色相走最短的一段弧；一端是灰色时色相取另一端；t 钳到 [0, 1]。 */
export function interpolateOklch(a: Rgba, b: Rgba): Interpolator<Rgba> {
  const x = toOklch(a)
  const y = toOklch(b)
  const h0 = x.c < ACHROMATIC ? y.h : x.h
  const h1 = y.c < ACHROMATIC ? x.h : y.h
  let dh = h1 - h0
  if (dh > 180)
    dh -= 360
  else if (dh < -180)
    dh += 360
  return (t) => {
    const s = clamp01(t)
    return fromOklch({
      l: x.l + (y.l - x.l) * s,
      c: x.c + (y.c - x.c) * s,
      h: (((h0 + dh * s) % 360) + 360) % 360,
      alpha: x.alpha + (y.alpha - x.alpha) * s,
    })
  }
}
