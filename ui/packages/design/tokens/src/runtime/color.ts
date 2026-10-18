/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 颜色能力：合成、亮度、对比度、择前景、择反向、混色与深浅。
// 写法解析、OKLCH 与线性光的换算、收进色域都取自 @xihan-ui/core/color 的浮点层，不取整到 8 位。
//
// 皮肤那侧有一份等价的 CSS 配方（styles/css/color.css），用相对颜色语法在浏览器里现算。
// 两处的判据必须一致：交叉点常量、通道权重、混色的色彩空间都在这里定义一次，
// CSS 那份的注释指回这里。

import type { ColorOklch } from '@xihan-ui/core/color'
import {
  colorClampChroma,
  colorFormatOklch,
  colorLinearRgbToOklch,
  colorLinearToSrgb,
  colorOklchToLinearRgb,
  colorParseOklch,
  colorSrgbToLinear,
} from '@xihan-ui/core/color'

function clampAlpha(value: number): number {
  if (!Number.isFinite(value))
    throw new Error(`颜色透明度必须是有限数值：${value}`)
  return Math.min(1, Math.max(0, value))
}

/** 解析 CSS 颜色到 OKLCH；写法错了或分量越界就抛。包内共用，不从入口导出。 */
export function parseColor(input: string): ColorOklch {
  const color = colorParseOklch(input)
  if (!color)
    throw new Error(`无法解析的颜色：${input}`)
  return color
}

function exact(n: number): string {
  return Object.is(n, -0) ? '0' : String(n)
}

/* ---------- 亮度与对比度 ---------- */

function toSrgb(color: ColorOklch): [number, number, number] {
  return colorOklchToLinearRgb(color)
    .map(v => colorLinearToSrgb(Math.min(1, Math.max(0, v)))) as [number, number, number]
}

/** CSS source-over：先把颜色换成 sRGB 编码通道，再按预乘 alpha 合成。 */
function compositeOklch(foreground: ColorOklch, backdrop: ColorOklch): ColorOklch {
  const foregroundAlpha = clampAlpha(foreground.a)
  const backdropAlpha = clampAlpha(backdrop.a)
  if (foregroundAlpha === 1)
    return { ...foreground, a: 1 }
  const alpha = foregroundAlpha + backdropAlpha * (1 - foregroundAlpha)
  if (alpha === 0)
    return { l: 0, c: 0, h: 0, a: 0 }
  if (foregroundAlpha === 0)
    return { ...backdrop, a: backdropAlpha }

  const foregroundRgb = toSrgb(foreground)
  const backdropRgb = toSrgb(backdrop)
  const rgb = foregroundRgb.map((channel, index) => (
    channel * foregroundAlpha
    + backdropRgb[index]! * backdropAlpha * (1 - foregroundAlpha)
  ) / alpha) as [number, number, number]

  return colorLinearRgbToOklch(
    colorSrgbToLinear(rgb[0]),
    colorSrgbToLinear(rgb[1]),
    colorSrgbToLinear(rgb[2]),
    alpha,
  )
}

/** 把 foreground 以 CSS source-over 叠在 backdrop 上，保留尚未铺满时的结果 alpha。 */
export function compositeColors(foreground: string, backdrop: string): string {
  const { l, c, h, a } = compositeOklch(
    parseColor(foreground),
    parseColor(backdrop),
  )
  const body = `${exact(l)} ${exact(colorClampChroma(l, c, h))} ${exact(h)}`
  return a === 1 ? `oklch(${body})` : `oklch(${body} / ${exact(a)})`
}

function requireOpaque(color: ColorOklch, backdrop: string | undefined): ColorOklch {
  if (color.a === 1)
    return color
  if (backdrop === undefined)
    throw new Error('半透明颜色必须提供最终不透明背景后才能计算亮度或对比度')
  const resolved = compositeOklch(color, parseColor(backdrop))
  if (resolved.a !== 1)
    throw new Error('颜色与背景合成后仍然透明，必须提供最终不透明背景')
  return resolved
}

function luminanceOf(color: ColorOklch): number {
  const [r, g, b] = colorOklchToLinearRgb(color)
    .map(v => Math.min(1, Math.max(0, v))) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * 白字与黑字对比度相等的那一点。
 *
 * 解 (1.05)/(Y+0.05) = (Y+0.05)/0.05 得 Y = √0.0525 − 0.05 ≈ 0.179。
 * 底色的相对亮度高于它就该配深字，低于它配浅字。
 */
export const ON_COLOR_CROSSOVER = 0.179

/** WCAG 相对亮度（0-1）。透明色必须同时提供最终不透明背景。 */
export function relativeLuminance(color: string, backdrop?: string): number {
  return luminanceOf(requireOpaque(parseColor(color), backdrop))
}

/** WCAG 对比度。透明背景需要最终 backdrop；透明前景压在解析后的背景上。 */
export function contrastRatio(foreground: string, background: string, backdrop?: string): number {
  const resolvedBackground = requireOpaque(parseColor(background), backdrop)
  const resolvedForeground = compositeOklch(parseColor(foreground), resolvedBackground)
  const [hi, lo] = [luminanceOf(resolvedForeground), luminanceOf(resolvedBackground)]
    .sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** 对比度阈值：正文 4.5、大字与非文字图形 3、加强档 7。 */
export const CONTRAST_MIN = { text: 4.5, large: 3, graphic: 3, enhanced: 7 } as const

/** 这一对够不够某一档阈值。 */
export function meetsContrast(
  foreground: string,
  background: string,
  level: keyof typeof CONTRAST_MIN = 'text',
  backdrop?: string,
): boolean {
  return contrastRatio(foreground, background, backdrop) >= CONTRAST_MIN[level]
}

/* ---------- 择色 ---------- */

/** 择色时用哪两档。缺省是纯白与纯黑——它们把对比度拉到最大。 */
export interface PickColorOptions {
  light?: string
  dark?: string
  /** background 自身透明时所压的最终不透明底色。 */
  backdrop?: string
}

const DEFAULT_PICK = { light: '#ffffff', dark: '#000000' } as const

/**
 * 压在这个底色上读得清的那一档：底色暗取浅色、亮取深色。
 *
 * 判据是 WCAG 相对亮度而不是 OKLCH 的 L——后者不含通道权重，
 * 同一个 L 上红与绿的实际亮度差得很远，按 L 分派会挑错边。
 */
export function pickOnColor(background: string, opts: PickColorOptions = {}): string {
  const { light = DEFAULT_PICK.light, dark = DEFAULT_PICK.dark, backdrop } = opts
  return contrastRatio(light, background, backdrop) >= contrastRatio(dark, background, backdrop)
    ? light
    : dark
}

/**
 * 交互态该往哪一侧挪：恒取 pickOnColor 的反面。
 *
 * 悬停与按下把底色往这个方向兑，对比度只会升不会降；
 * 跟着前景走的话，底色会越挪越贴近字色。
 */
export function pickAwayColor(background: string, opts: PickColorOptions = {}): string {
  const { light = DEFAULT_PICK.light, dark = DEFAULT_PICK.dark } = opts
  return pickOnColor(background, opts) === light ? dark : light
}

/* ---------- 变换 ---------- */

function oklchToOklab({ l, c, h }: ColorOklch): [number, number, number] {
  const hr = (h * Math.PI) / 180
  return [l, c * Math.cos(hr), c * Math.sin(hr)]
}

function oklabToOklch(l: number, a: number, b: number, alpha: number): ColorOklch {
  let h = (Math.atan2(b, a) * 180) / Math.PI
  if (h < 0)
    h += 360
  return { l, c: Math.hypot(a, b), h, a: clampAlpha(alpha) }
}

/**
 * 按比例混两个颜色，与 CSS 的 `color-mix(in oklab, a <weight>%, b)` 同一条路。
 *
 * weight 是 a 占的比例（0-1）。在 oklab 里插值而不是 oklch：
 * oklch 走的是极坐标，色相会绕远路，与 CSS 那条对不上。
 */
export function mixColors(a: string, b: string, weight = 0.5): string {
  const w = Math.min(1, Math.max(0, weight))
  const left = parseColor(a)
  const right = parseColor(b)
  const [al, aa, ab] = oklchToOklab(left)
  const [bl, ba, bb] = oklchToOklab(right)
  const leftWeight = left.a * w
  const rightWeight = right.a * (1 - w)
  const alpha = leftWeight + rightWeight
  if (alpha === 0)
    return colorFormatOklch({ l: 0, c: 0, h: 0, a: 0 })
  return colorFormatOklch(oklabToOklch(
    (al * leftWeight + bl * rightWeight) / alpha,
    (aa * leftWeight + ba * rightWeight) / alpha,
    (ab * leftWeight + bb * rightWeight) / alpha,
    alpha,
  ))
}

/** 提亮：把 OKLCH 的 L 往 1 抬 amount（0-1），彩度按色域收。 */
export function lighten(color: string, amount: number): string {
  const { l, c, h, a } = parseColor(color)
  return colorFormatOklch({ l: Math.min(1, l + amount), c, h, a })
}

/** 压暗：把 OKLCH 的 L 往 0 压 amount（0-1），彩度按色域收。 */
export function darken(color: string, amount: number): string {
  const { l, c, h, a } = parseColor(color)
  return colorFormatOklch({ l: Math.max(0, l - amount), c, h, a })
}

/** 换一档不透明度，产出 `oklch(l c h / a)`。原色自带的 alpha 不保留。 */
export function withAlpha(color: string, alpha: number): string {
  const { l, c, h } = parseColor(color)
  return colorFormatOklch({ l, c, h, a: clampAlpha(alpha) })
}
