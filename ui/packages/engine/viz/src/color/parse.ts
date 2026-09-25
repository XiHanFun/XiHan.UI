/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 颜色串解析：十六进制、rgb()、hsl()、oklab()、oklch()，逗号与空格两种写法都认；不认颜色关键字。

import type { Rgba } from './space'
import { fromOklab, fromOklch } from './space'

interface Token {
  readonly value: number
  readonly unit: '' | '%' | 'deg' | 'rad' | 'grad' | 'turn'
}

const NUMBER = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)(%|deg|rad|grad|turn)?$/i

function token(text: string): Token | null {
  const matched = NUMBER.exec(text)
  if (!matched)
    return null
  return { value: Number(matched[1]), unit: (matched[2] ?? '').toLowerCase() as Token['unit'] }
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value))
}

/** 百分比按 percentOf 为 100% 折算；不许带角度单位。 */
function amount(t: Token, percentOf: number): number | null {
  if (t.unit === '%')
    return (t.value / 100) * percentOf
  return t.unit === '' ? t.value : null
}

/** 色相角：无单位按度；超出一圈取余。 */
function hue(t: Token): number | null {
  let degrees: number
  switch (t.unit) {
    case '':
    case 'deg':
      degrees = t.value
      break
    case 'rad':
      degrees = (t.value * 180) / Math.PI
      break
    case 'grad':
      degrees = t.value * 0.9
      break
    case 'turn':
      degrees = t.value * 360
      break
    default:
      return null
  }
  return ((degrees % 360) + 360) % 360
}

function parseHex(text: string): Rgba | null {
  const matched = /^#?([0-9a-f]+)$/i.exec(text)
  if (!matched)
    return null
  const hex = matched[1] as string
  if (![3, 4, 6, 8].includes(hex.length))
    return null
  const full = hex.length <= 4 ? [...hex].map(ch => ch + ch).join('') : hex
  const pair = (i: number): number => Number.parseInt(full.slice(i * 2, i * 2 + 2), 16)
  return { r: pair(0), g: pair(1), b: pair(2), a: full.length === 8 ? pair(3) / 255 : 1 }
}

/** HSL（s、l 为 0–1）→ sRGB。 */
function hslToRgb(h: number, s: number, l: number, a: number): Rgba {
  const k = (n: number): number => (n + h / 30) % 12
  const f = (n: number): number => l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255, a }
}

/** 解析 CSS 颜色串；无法解析时返回 null。通道越界按 CSS 规则钳到合法范围，oklab / oklch 超出 sRGB 时降彩度收回。 */
export function parseColor(input: string): Rgba | null {
  const text = input.trim().toLowerCase()
  if (text === '')
    return null
  const fn = /^(rgba?|hsla?|oklab|oklch)\(([^)]*)\)$/.exec(text)
  if (!fn)
    return parseHex(text)

  const parts = (fn[2] as string).split(/[\s,/]+/).filter(Boolean).map(token)
  if ((parts.length !== 3 && parts.length !== 4) || parts.includes(null))
    return null
  const [p0, p1, p2, p3] = parts as Token[]
  const alpha = p3 === undefined ? 1 : amount(p3, 1)
  if (alpha === null)
    return null
  const a = clamp(alpha, 0, 1)
  const name = fn[1] as string

  if (name.startsWith('rgb')) {
    const channels = [p0, p1, p2].map(p => amount(p as Token, 255))
    if (channels.includes(null))
      return null
    const [r, g, b] = channels.map(c => clamp(c as number, 0, 255)) as [number, number, number]
    return { r, g, b, a }
  }
  if (name.startsWith('hsl')) {
    const h = hue(p0 as Token)
    const s = amount(p1 as Token, 100)
    const l = amount(p2 as Token, 100)
    if (h === null || s === null || l === null)
      return null
    return hslToRgb(h, clamp(s, 0, 100) / 100, clamp(l, 0, 100) / 100, a)
  }
  const l = amount(p0 as Token, 1)
  if (l === null)
    return null
  if (name === 'oklab') {
    // a、b 的百分比按规范以 0.4 为 100%
    const x = amount(p1 as Token, 0.4)
    const y = amount(p2 as Token, 0.4)
    if (x === null || y === null)
      return null
    return fromOklab({ l: clamp(l, 0, 1), a: x, b: y, alpha: a })
  }
  const c = amount(p1 as Token, 0.4)
  const h = hue(p2 as Token)
  if (c === null || h === null)
    return null
  return fromOklch({ l: clamp(l, 0, 1), c: Math.max(0, c), h, alpha: a })
}
