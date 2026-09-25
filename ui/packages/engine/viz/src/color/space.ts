/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 颜色空间换算：sRGB ↔ 线性 sRGB ↔ OKLab ↔ OKLCH。OKLab 矩阵取 Ottosson 发表的版本，与令牌运行时同一组。

/** sRGB 颜色：r、g、b 为 0–255（可带小数），a 为 0–1。 */
export interface Rgba {
  readonly r: number
  readonly g: number
  readonly b: number
  readonly a: number
}

/** OKLab：L 为 0–1 的感知明度，a、b 为对立色轴。 */
export interface Oklab {
  readonly l: number
  readonly a: number
  readonly b: number
  readonly alpha: number
}

/** OKLCH：L 为 0–1，c 为彩度（≥ 0），h 为色相角 0–360（彩度为 0 时无意义，记为 0）。 */
export interface Oklch {
  readonly l: number
  readonly c: number
  readonly h: number
  readonly alpha: number
}

/** sRGB 通道（0–1）→ 线性光。 */
export function srgbToLinear(value: number): number {
  const v = Math.abs(value)
  const linear = v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  return Math.sign(value) * linear
}

/** 线性光 → sRGB 通道（0–1）。 */
export function linearToSrgb(value: number): number {
  const v = Math.abs(value)
  const encoded = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055
  return Math.sign(value) * encoded
}

/** Rgba → 线性 sRGB 三通道（0–1）。 */
export function toLinearRgb(color: Rgba): [number, number, number] {
  return [srgbToLinear(color.r / 255), srgbToLinear(color.g / 255), srgbToLinear(color.b / 255)]
}

/** 线性 sRGB → Rgba；通道钳到色域内。 */
export function fromLinearRgb(r: number, g: number, b: number, alpha = 1): Rgba {
  const channel = (v: number): number => Math.min(255, Math.max(0, linearToSrgb(v) * 255))
  return { r: channel(r), g: channel(g), b: channel(b), a: alpha }
}

function linearToOklab(r: number, g: number, b: number, alpha: number): Oklab {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    alpha,
  }
}

/** OKLab → 线性 sRGB（不钳制，越界说明在色域外）。 */
export function oklabToLinearRgb(color: Oklab): [number, number, number] {
  const l = (color.l + 0.3963377774 * color.a + 0.2158037573 * color.b) ** 3
  const m = (color.l - 0.1055613458 * color.a - 0.0638541728 * color.b) ** 3
  const s = (color.l - 0.0894841775 * color.a - 1.291485548 * color.b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

export function toOklab(color: Rgba): Oklab {
  const [r, g, b] = toLinearRgb(color)
  return linearToOklab(r, g, b, color.a)
}

export function oklabToOklch(color: Oklab): Oklch {
  const c = Math.hypot(color.a, color.b)
  const h = c < 1e-7 ? 0 : ((Math.atan2(color.b, color.a) * 180) / Math.PI + 360) % 360
  return { l: color.l, c, h, alpha: color.alpha }
}

export function oklchToOklab(color: Oklch): Oklab {
  const radians = (color.h * Math.PI) / 180
  return { l: color.l, a: color.c * Math.cos(radians), b: color.c * Math.sin(radians), alpha: color.alpha }
}

export function toOklch(color: Rgba): Oklch {
  return oklabToOklch(toOklab(color))
}

const GAMUT_EPSILON = 1e-7

function inGamut(linear: readonly number[]): boolean {
  return linear.every(v => v >= -GAMUT_EPSILON && v <= 1 + GAMUT_EPSILON)
}

/**
 * OKLCH → sRGB。超出 sRGB 色域时固定明度与色相、二分降低彩度直到落回色域，
 * 色相不漂移；L ≥ 1 为白，L ≤ 0 为黑。
 */
export function fromOklch(color: Oklch): Rgba {
  if (color.l >= 1)
    return { r: 255, g: 255, b: 255, a: color.alpha }
  if (color.l <= 0)
    return { r: 0, g: 0, b: 0, a: color.alpha }
  let linear = oklabToLinearRgb(oklchToOklab(color))
  if (!inGamut(linear)) {
    let low = 0
    let high = color.c
    for (let i = 0; i < 40; i++) {
      const mid = (low + high) / 2
      if (inGamut(oklabToLinearRgb(oklchToOklab({ ...color, c: mid }))))
        low = mid
      else
        high = mid
    }
    linear = oklabToLinearRgb(oklchToOklab({ ...color, c: low }))
  }
  return fromLinearRgb(linear[0], linear[1], linear[2], color.alpha)
}

/** OKLab → sRGB，色域外的颜色按 fromOklch 的方式收回。 */
export function fromOklab(color: Oklab): Rgba {
  return fromOklch(oklabToOklch(color))
}

/** Rgba → `#rrggbb`（不透明）或 `#rrggbbaa`。 */
export function formatHex(color: Rgba): string {
  const pair = (v: number): string => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')
  const base = `#${pair(color.r)}${pair(color.g)}${pair(color.b)}`
  return color.a >= 1 ? base : `${base}${pair(color.a * 255)}`
}
