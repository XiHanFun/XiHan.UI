/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 画布的颜色：从计算样式读到的颜色串原样解析（不换算、不收回色域），按 CSS color-mix 的同一规则插值，
// 结果以插值空间的函数式写回，交给画布；浏览器把它换算到屏幕的那条路与 CSS 是同一条，画布与 SVG 的颜色才一致。

import { oklabToLinearRgb, toOklab } from '../color/space'

/** 解析出来的颜色：保留原来的颜色空间与坐标。 */
export interface CssColor {
  /** srgb、srgb-linear 的坐标是 0–1；oklab 是 [L, a, b]；oklch 是 [L, C, H]（H 为 NaN 表示无色相）。 */
  readonly space: 'srgb' | 'srgb-linear' | 'oklab' | 'oklch'
  readonly coords: readonly [number, number, number]
  readonly alpha: number
}

/** 插值空间：与 CSS color-mix 的 in 后面那个词一致。 */
export type MixSpace = 'srgb' | 'oklab' | 'oklch'

/** 彩度低于它时色相不可靠，按「无色相」处理（插值时取另一端的色相）。 */
const ACHROMATIC = 1e-4

const NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i

/** 一个分量：数、百分比（按 percentOf 为 100%）或 none（NaN）。 */
function component(text: string, percentOf: number): number | null {
  if (text === 'none')
    return Number.NaN
  if (text.endsWith('%')) {
    const body = text.slice(0, -1)
    return NUMBER.test(body) ? (Number(body) / 100) * percentOf : null
  }
  return NUMBER.test(text) ? Number(text) : null
}

/** 色相：数或带 deg 单位。 */
function hueOf(text: string): number | null {
  if (text === 'none')
    return Number.NaN
  const body = text.endsWith('deg') ? text.slice(0, -3) : text
  if (!NUMBER.test(body))
    return null
  const degrees = Number(body)
  // 已在一圈之内的原样保留：取余会带出浮点尾巴
  return degrees >= 0 && degrees < 360 ? degrees : ((degrees % 360) + 360) % 360
}

function hex(text: string): CssColor | null {
  const matched = /^#([0-9a-f]{3,8})$/i.exec(text)
  if (!matched)
    return null
  const digits = matched[1] as string
  if (![3, 4, 6, 8].includes(digits.length))
    return null
  const full = digits.length <= 4 ? [...digits].map(ch => ch + ch).join('') : digits
  const pair = (i: number): number => Number.parseInt(full.slice(i * 2, i * 2 + 2), 16) / 255
  return { space: 'srgb', coords: [pair(0), pair(1), pair(2)], alpha: full.length === 8 ? pair(3) : 1 }
}

/**
 * 解析浏览器计算样式会给出的颜色串：`rgb()` / `rgba()`（逗号与空格两种写法）、十六进制、`oklch()`、`oklab()`、
 * `color(srgb …)`、`color(srgb-linear …)`；transparent 是全透明的黑。认不出的写法返回 null。
 */
export function parseCssColor(input: string): CssColor | null {
  const text = input.trim().toLowerCase()
  if (text === 'transparent')
    return { space: 'srgb', coords: [0, 0, 0], alpha: 0 }
  if (text.startsWith('#'))
    return hex(text)
  const fn = /^(rgba?|oklch|oklab|color)\((.*)\)$/.exec(text)
  if (!fn)
    return null
  const name = fn[1] as string
  let body = (fn[2] as string).trim()
  let space: CssColor['space'] | null = null
  if (name === 'color') {
    // 先认长的那个：srgb-linear 也以 srgb 开头
    space = body.startsWith('srgb-linear ') ? 'srgb-linear' : body.startsWith('srgb ') ? 'srgb' : null
    if (!space)
      return null
    body = body.slice(space.length).trim()
  }
  // 斜线后是 alpha；逗号写法（旧式 rgb）第四个分量是 alpha
  const [main, slash] = body.split('/').map(part => part.trim()) as [string, string | undefined]
  const parts = main.split(/[\s,]+/).filter(Boolean)
  let alphaText = slash
  if (parts.length === 4 && alphaText === undefined)
    alphaText = parts.pop()
  if (parts.length !== 3)
    return null
  const alpha = alphaText === undefined ? 1 : component(alphaText, 1)
  if (alpha === null)
    return null
  const a = Number.isNaN(alpha) ? 0 : Math.min(1, Math.max(0, alpha))
  if (name === 'rgb' || name === 'rgba') {
    const channels = parts.map(p => component(p, 255))
    if (channels.includes(null))
      return null
    const [r, g, b] = channels.map(c => (Number.isNaN(c as number) ? 0 : (c as number) / 255)) as [number, number, number]
    return { space: 'srgb', coords: [r, g, b], alpha: a }
  }
  if (name === 'oklch') {
    const l = component(parts[0] as string, 1)
    const c = component(parts[1] as string, 0.4)
    const h = hueOf(parts[2] as string)
    if (l === null || c === null || h === null)
      return null
    return { space: 'oklch', coords: [Number.isNaN(l) ? 0 : l, Number.isNaN(c) ? 0 : c, h], alpha: a }
  }
  const coords = (name === 'oklab'
    ? [component(parts[0] as string, 1), component(parts[1] as string, 0.4), component(parts[2] as string, 0.4)]
    : parts.map(p => component(p, 1)))
  if (coords.includes(null))
    return null
  const [x, y, z] = coords.map(v => (Number.isNaN(v as number) ? 0 : v as number)) as [number, number, number]
  return { space: name === 'oklab' ? 'oklab' : space ?? 'srgb', coords: [x, y, z], alpha: a }
}

/** 换到 OKLab：[L, a, b]。 */
function toLab(color: CssColor): [number, number, number] {
  const [x, y, z] = color.coords
  switch (color.space) {
    case 'oklab':
      return [x, y, z]
    case 'oklch': {
      const h = Number.isNaN(z) ? 0 : (z * Math.PI) / 180
      return [x, y * Math.cos(h), y * Math.sin(h)]
    }
    case 'srgb-linear': {
      const lab = toOklab({ r: linearToChannel(x), g: linearToChannel(y), b: linearToChannel(z), a: 1 })
      return [lab.l, lab.a, lab.b]
    }
    default: {
      const lab = toOklab({ r: x * 255, g: y * 255, b: z * 255, a: 1 })
      return [lab.l, lab.a, lab.b]
    }
  }
}

/** 线性光换回 0–255 的 sRGB 通道（不钳制，toOklab 再换回线性时原样还原）。 */
function linearToChannel(value: number): number {
  const v = Math.abs(value)
  const encoded = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055
  return Math.sign(value) * encoded * 255
}

/** 换到 OKLCH：[L, C, H]，无彩度时 H 为 NaN。 */
function toLch(color: CssColor): [number, number, number] {
  if (color.space === 'oklch')
    return [color.coords[0], color.coords[1], color.coords[1] < ACHROMATIC ? Number.NaN : color.coords[2]]
  const [l, a, b] = toLab(color)
  const c = Math.hypot(a, b)
  return [l, c, c < ACHROMATIC ? Number.NaN : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360]
}

/** 换到 sRGB（0–1，不钳制）。 */
function toSrgb(color: CssColor): [number, number, number] {
  if (color.space === 'srgb')
    return [...color.coords]
  if (color.space === 'srgb-linear')
    return color.coords.map(v => linearToChannel(v) / 255) as [number, number, number]
  const [l, a, b] = toLab(color)
  return oklabToLinearRgb({ l, a, b, alpha: 1 }).map(v => linearToChannel(v) / 255) as [number, number, number]
}

/**
 * 按 CSS `color-mix(in <space>, a <p>%, b)` 的规则混合：p 是 a 的权重（0–1）。两端先换到插值空间，
 * alpha 预乘（色相不预乘），oklch 的色相走较短的那段弧，一端无色相时取另一端的色相。
 */
export function mixCssColor(a: CssColor, b: CssColor, p: number, space: MixSpace): CssColor {
  const w = Math.min(1, Math.max(0, p))
  const alpha = a.alpha * w + b.alpha * (1 - w)
  const unpremultiply = (value: number): number => (alpha === 0 ? 0 : value / alpha)
  if (space === 'oklch') {
    const [l1, c1, h1] = toLch(a)
    const [l2, c2, h2] = toLch(b)
    const ha = Number.isNaN(h1) ? h2 : h1
    const hb = Number.isNaN(h2) ? h1 : h2
    let h = Number.NaN
    if (!Number.isNaN(ha) && !Number.isNaN(hb)) {
      let d = hb - ha
      if (d > 180)
        d -= 360
      else if (d < -180)
        d += 360
      h = (((ha + d * (1 - w)) % 360) + 360) % 360
    }
    return {
      space: 'oklch',
      coords: [
        unpremultiply(l1 * a.alpha * w + l2 * b.alpha * (1 - w)),
        unpremultiply(c1 * a.alpha * w + c2 * b.alpha * (1 - w)),
        h,
      ],
      alpha,
    }
  }
  const [x1, y1, z1] = space === 'oklab' ? toLab(a) : toSrgb(a)
  const [x2, y2, z2] = space === 'oklab' ? toLab(b) : toSrgb(b)
  const mix = (u: number, v: number): number => unpremultiply(u * a.alpha * w + v * b.alpha * (1 - w))
  return { space: space === 'oklab' ? 'oklab' : 'srgb', coords: [mix(x1, x2), mix(y1, y2), mix(z1, z2)], alpha }
}

/** 数写短：去掉浮点尾巴，至多 6 位小数。 */
function short(value: number): string {
  return String(Math.round(value * 1e6) / 1e6)
}

/** 写成 CSS 颜色串，保留原来的空间：oklch / oklab 写函数式，sRGB 写 `color(srgb …)`。 */
export function formatCssColor(color: CssColor): string {
  const [x, y, z] = color.coords
  const alpha = color.alpha < 1 ? ` / ${short(color.alpha)}` : ''
  switch (color.space) {
    case 'oklch':
      return `oklch(${short(x)} ${short(y)} ${Number.isNaN(z) ? 'none' : short(z)}${alpha})`
    case 'oklab':
      return `oklab(${short(x)} ${short(y)} ${short(z)}${alpha})`
    case 'srgb-linear':
      return `color(srgb-linear ${short(x)} ${short(y)} ${short(z)}${alpha})`
    default:
      return `color(srgb ${short(x)} ${short(y)} ${short(z)}${alpha})`
  }
}

/**
 * 按浏览器在 sRGB 屏上的画法写成 `rgb()`：换到 sRGB 后逐通道截断到 0–1（不降彩度）。
 * 画布不认某种颜色写法时用它。
 */
export function formatSrgbColor(color: CssColor): string {
  const [r, g, b] = toSrgb(color).map(v => Math.round(Math.min(1, Math.max(0, v)) * 255))
  return color.alpha < 1 ? `rgb(${r} ${g} ${b} / ${short(color.alpha)})` : `rgb(${r} ${g} ${b})`
}

/** 换到 sRGB 的四个通道（0–1，不钳制）：比较两种写法是不是同一个颜色时用。 */
export function srgbOf(color: CssColor): [number, number, number, number] {
  const [r, g, b] = toSrgb(color)
  return [r, g, b, color.alpha]
}

/**
 * 色阶查找表：stops 均匀分布在 0–1 上（三个锚点即 0、0.5、1），相邻两个锚点之间按 space 插值，
 * 预先算好 steps 级；返回按位置取颜色串的函数。与皮肤里两段 color-mix 的色阶同一算法。
 */
export function createColorRamp(stops: readonly CssColor[], space: MixSpace, steps = 256, format: (color: CssColor) => string = formatCssColor): (t: number) => string {
  if (stops.length === 0)
    return () => 'transparent'
  if (stops.length === 1) {
    const only = format(stops[0] as CssColor)
    return () => only
  }
  const levels = Math.max(2, Math.floor(steps))
  const table: string[] = []
  const segments = stops.length - 1
  for (let k = 0; k < levels; k++) {
    const t = k / (levels - 1)
    const s = Math.min(segments - 1, Math.floor(t * segments))
    const local = t * segments - s
    // local 是往终点走了多少：终点的权重是 local，起点是 1 − local
    table.push(format(mixCssColor(stops[s + 1] as CssColor, stops[s] as CssColor, local, space)))
  }
  return (t: number): string => table[Math.round(Math.min(1, Math.max(0, Number.isNaN(t) ? 0 : t)) * (levels - 1))] as string
}
