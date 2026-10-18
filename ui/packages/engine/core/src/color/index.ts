/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/core/color —— 颜色换算的纯函数：十六进制、RGB、HSV、HSL 与 OKLCH 互转，CSS 颜色写法的解析与写出。
// 不碰 DOM、零依赖。分两层：
// - 8 位层（ColorRgba 与 colorParse、colorToString 等）：结果落在 8 位 sRGB 里，超出 sRGB 色域的颜色按通道裁剪
//   （每一路夹回 0-255），不做感知映射。
// - 浮点层（线性光、OKLCH 与 colorParseOklch、colorFormatOklch）：不取整、不截断；收进色域另由
//   colorClampChroma 固定明度与色相、只收彩度。8 位层建在浮点层上，两层共用同一套矩阵与同一套写法解析。

/** 值串的写法。oklch 是 CSS Color 4 的感知均匀写法（与本库令牌同一色空间）。 */
export type ColorFormat = 'hex' | 'rgba' | 'hsla' | 'oklch'

/** r/g/b 是 0-255 的整数，a 是 0-1 的小数。 */
export interface ColorRgba {
  r: number
  g: number
  b: number
  a: number
}

/** h 是 0-360 的角度，s/v 是 0-100 的百分数，a 是 0-1 的小数。 */
export interface ColorHsva {
  h: number
  s: number
  v: number
  a: number
}

/** h 是 0-360 的角度，s/l 是 0-100 的百分数，a 是 0-1 的小数。 */
export interface ColorHsla {
  h: number
  s: number
  l: number
  a: number
}

/** l 是 0-1 的感知明度，c 是彩度（sRGB 内不超过 0.4 上下），h 是 0-360 的角度，a 是 0-1 的小数。 */
export interface ColorOklch {
  l: number
  c: number
  h: number
  a: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function toChannel255(n: number): number {
  return Number.isFinite(n) ? clamp(Math.round(n), 0, 255) : 0
}

function toAlpha01(n: number): number {
  return Number.isFinite(n) ? clamp(n, 0, 1) : 1
}

/** 角度归一到 [0, 360)。负角与超过一圈的角都收得回来。 */
function toDegree(n: number): number {
  if (!Number.isFinite(n))
    return 0
  const wrapped = n % 360
  return wrapped < 0 ? wrapped + 360 : wrapped
}

function toPercent(n: number): number {
  return Number.isFinite(n) ? clamp(n, 0, 100) : 0
}

/** 各通道夹回合法区间并把 r/g/b 取整。比较两个颜色前必须先过这一道。 */
export function colorNormalizeRgba(rgba: ColorRgba): ColorRgba {
  return {
    r: toChannel255(rgba.r),
    g: toChannel255(rgba.g),
    b: toChannel255(rgba.b),
    a: toAlpha01(rgba.a),
  }
}

export function colorNormalizeHsva(hsva: ColorHsva): ColorHsva {
  return {
    h: toDegree(hsva.h),
    s: toPercent(hsva.s),
    v: toPercent(hsva.v),
    a: toAlpha01(hsva.a),
  }
}

/**
 * 十六进制串 → RGBA。接受 3/4/6/8 位，`#` 可省。
 * 位数不对一律返回 null，由调用方决定保留草稿还是复原。
 */
export function colorHexToRgba(input: string): ColorRgba | null {
  const matched = /^#?([0-9a-f]+)$/i.exec(input.trim())
  if (!matched)
    return null
  const hex = matched[1]!
  const short = hex.length === 3 || hex.length === 4
  if (!short && hex.length !== 6 && hex.length !== 8)
    return null
  // 三/四位是每位重复一次的简写：#f0a → #ff00aa
  const full = short ? [...hex].map(ch => ch + ch).join('') : hex
  const pair = (index: number): number => Number.parseInt(full.slice(index * 2, index * 2 + 2), 16)
  return {
    r: pair(0),
    g: pair(1),
    b: pair(2),
    a: full.length === 8 ? pair(3) / 255 : 1,
  }
}

function hexPair(n: number): string {
  return toChannel255(n).toString(16).padStart(2, '0')
}

/** RGBA → 十六进制串。withAlpha 才输出第四对，否则恒是六位。 */
export function colorRgbaToHex(rgba: ColorRgba, withAlpha = false): string {
  const base = `#${hexPair(rgba.r)}${hexPair(rgba.g)}${hexPair(rgba.b)}`
  return withAlpha ? `${base}${hexPair(toAlpha01(rgba.a) * 255)}` : base
}

/** 三个 0-1 分量算色相角。灰度（最大与最小相等）时色相无定义，此时交回 hint。 */
function hueOf(r: number, g: number, b: number, max: number, delta: number, hint: number): number {
  if (delta === 0)
    return toDegree(hint)
  if (max === r)
    return toDegree(60 * (((g - b) / delta) % 6))
  if (max === g)
    return toDegree(60 * ((b - r) / delta + 2))
  return toDegree(60 * ((r - g) / delta + 4))
}

/**
 * RGBA → HSVA。
 * hueHint 是灰度色的色相兜底：灰度处色相算不出来，不给兜底会一律落到 0。
 */
export function colorRgbaToHsva(rgba: ColorRgba, hueHint = 0): ColorHsva {
  const { r, g, b, a } = colorNormalizeRgba(rgba)
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255
  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  const delta = max - min
  return {
    h: hueOf(rr, gg, bb, max, delta, hueHint),
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
    a,
  }
}

export function colorHsvaToRgba(hsva: ColorHsva): ColorRgba {
  const { h, s, v, a } = colorNormalizeHsva(hsva)
  const sat = s / 100
  const val = v / 100
  const c = val * sat
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = val - c
  const sector = Math.floor(h / 60) % 6
  const table: Array<[number, number, number]> = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ]
  const [r, g, b] = table[sector] ?? [0, 0, 0]
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a,
  }
}

export function colorRgbaToHsla(rgba: ColorRgba, hueHint = 0): ColorHsla {
  const { r, g, b, a } = colorNormalizeRgba(rgba)
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255
  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  const delta = max - min
  const l = (max + min) / 2
  // 分母在纯黑/纯白处为 0，除下去会得到 Infinity，此时饱和度取 0
  const denominator = 1 - Math.abs(2 * l - 1)
  return {
    h: hueOf(rr, gg, bb, max, delta, hueHint),
    s: delta === 0 || denominator === 0 ? 0 : (delta / denominator) * 100,
    l: l * 100,
    a,
  }
}

/** HSL 三路（h 角度、s/l 是 0-1）→ sRGB 三路（0-255，不取整）。 */
function hslToRgb255(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  const sector = Math.floor(h / 60) % 6
  const table: Array<[number, number, number]> = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ]
  const [r, g, b] = table[sector] ?? [0, 0, 0]
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255]
}

export function colorHslaToRgba(hsla: ColorHsla): ColorRgba {
  const [r, g, b] = hslToRgb255(toDegree(hsla.h), toPercent(hsla.s) / 100, toPercent(hsla.l) / 100)
  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
    a: toAlpha01(hsla.a),
  }
}

/* ---------- 浮点层：线性光与 OKLCH ---------- */

/** sRGB 伽马编码的一路（0-1）→ 线性光。 */
export function colorSrgbToLinear(x: number): number {
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}

/** 线性光 → sRGB 伽马编码的一路，不截断：超出 0-1 的输入照样换算。 */
export function colorLinearToSrgb(x: number): number {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
}

/** 线性光 → sRGB 伽马编码的一路，超出 sRGB 的部分夹回 0-1。 */
function linearToSrgbClamped(c: number): number {
  const encoded = colorLinearToSrgb(c)
  return Number.isFinite(encoded) ? clamp(encoded, 0, 1) : 0
}

/** 彩度低于它即当作无彩色：色相无定义，交回 hint。 */
const OKLCH_ACHROMATIC = 0.0001

/** OKLab → OKLCH：明度夹进 0-1，无彩色处色相取 hint。 */
function oklabToOklch(L: number, A: number, B: number, alpha: number, hueHint: number): ColorOklch {
  const c = Math.hypot(A, B)
  return {
    l: clamp(L, 0, 1),
    c,
    h: c < OKLCH_ACHROMATIC ? toDegree(hueHint) : toDegree((Math.atan2(B, A) * 180) / Math.PI),
    a: toAlpha01(alpha),
  }
}

/** OKLab → 线性 sRGB 三路，不截断（Björn Ottosson 的矩阵）。 */
function oklabToLinear(L: number, A: number, B: number): [number, number, number] {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

/**
 * 线性 sRGB 三路 → OKLCH（Björn Ottosson 的 OKLab 换算，再转极坐标），不取整。
 * 明度夹进 0-1；彩度低于万分之一时当作无彩色，色相取 hueHint。
 */
export function colorLinearRgbToOklch(r: number, g: number, b: number, alpha = 1, hueHint = 0): ColorOklch {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return oklabToOklch(
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    alpha,
    hueHint,
  )
}

/** OKLCH → 线性 sRGB 三路，不截断：色域判定看的就是这里的原始分量。 */
export function colorOklchToLinearRgb({ l, c, h }: ColorOklch): [number, number, number] {
  const hr = (h * Math.PI) / 180
  return oklabToLinear(l, c * Math.cos(hr), c * Math.sin(hr))
}

/**
 * RGBA → OKLCH。
 * hueHint 是无彩色处的色相兜底。
 */
export function colorRgbaToOklch(rgba: ColorRgba, hueHint = 0): ColorOklch {
  const { r, g, b, a } = colorNormalizeRgba(rgba)
  return colorLinearRgbToOklch(colorSrgbToLinear(r / 255), colorSrgbToLinear(g / 255), colorSrgbToLinear(b / 255), a, hueHint)
}

/** 三路线性光（0-1）→ RGBA，超出 sRGB 的部分按通道夹回。 */
function linearToRgba(lr: number, lg: number, lb: number, a: number): ColorRgba {
  return {
    r: Math.round(linearToSrgbClamped(lr) * 255),
    g: Math.round(linearToSrgbClamped(lg) * 255),
    b: Math.round(linearToSrgbClamped(lb) * 255),
    a: toAlpha01(a),
  }
}

/** OKLab → RGBA；落在 sRGB 之外的颜色按通道裁剪。 */
function oklabToRgba(L: number, A: number, B: number, a: number): ColorRgba {
  const [r, g, b] = oklabToLinear(L, A, B)
  return linearToRgba(r, g, b, a)
}

/** OKLCH → RGBA；落在 sRGB 之外的颜色按通道裁剪（每一路夹回 0-255），不做感知映射。 */
export function colorOklchToRgba(oklch: ColorOklch): ColorRgba {
  const l = Number.isFinite(oklch.l) ? clamp(oklch.l, 0, 1) : 0
  const c = Number.isFinite(oklch.c) ? Math.max(0, oklch.c) : 0
  const [r, g, b] = colorOklchToLinearRgb({ l, c, h: toDegree(oklch.h), a: oklch.a })
  return linearToRgba(r, g, b, oklch.a)
}

/* ---------- 色域 ---------- */

/** 线性分量越出 0-1 不超过这么多，仍算在 sRGB 色域内。 */
const GAMUT_EPS = 0.05

/** 这个 OKLCH 落不落在 sRGB 色域内：三路线性分量都在 [-0.05, 1.05] 里即算。 */
export function colorInSrgbGamut(color: ColorOklch): boolean {
  return colorOklchToLinearRgb(color).every(v => v >= -GAMUT_EPS && v <= 1 + GAMUT_EPS)
}

/** 固定 L 与 H，把 C 收到 sRGB 色域内的最大可用值（二分 32 次）；本就在色域内时原样返回。 */
export function colorClampChroma(l: number, c: number, h: number): number {
  if (colorInSrgbGamut({ l, c, h, a: 1 }))
    return c
  let lo = 0
  let hi = c
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2
    if (colorInSrgbGamut({ l, c: mid, h, a: 1 }))
      lo = mid
    else hi = mid
  }
  return lo
}

/* ---------- 写法解析 ---------- */

/** 函数式记法里的一个参数：`50%` 按 scale 换算，`210deg` 去掉单位，`none`（缺省分量）取 0，其余按裸数取。 */
function functionArg(token: string, scale: number): number {
  const raw = token.trim()
  if (raw === 'none')
    return 0
  if (raw.endsWith('%'))
    return Number(raw.slice(0, -1)) * scale
  if (raw.endsWith('deg'))
    return Number(raw.slice(0, -3))
  return Number(raw)
}

/** 色相参数：在 functionArg 之外再认 grad、rad、turn，一律折成度。grad 要排在 rad 前面比。 */
const HUE_UNITS: ReadonlyArray<readonly [string, number]> = [['grad', 0.9], ['rad', 180 / Math.PI], ['turn', 360]]

function hueArg(token: string): number {
  const raw = token.trim()
  for (const [unit, degrees] of HUE_UNITS) {
    if (raw.endsWith(unit))
      return Number(raw.slice(0, -unit.length)) * degrees
  }
  return functionArg(raw, 1)
}

function splitArgs(body: string): string[] {
  // 逗号、空白、斜杠三种分隔写法都收：rgb(1 2 3 / 50%) 与 rgba(1,2,3,0.5) 是同一件事
  return body.split(/[\s,/]+/).filter(Boolean)
}

/** 现代写法的参数：三个分量只认空白分隔，透明度跟在斜杠后面、可省；分量个数不对返回 null。 */
function modernArgs(body: string): { readonly channels: string[], readonly alpha: number } | null {
  const [channels, alphaPart, ...rest] = body.split('/')
  if (rest.length > 0 || channels === undefined)
    return null
  const args = channels.trim().split(/\s+/).filter(Boolean)
  const alpha = alphaPart === undefined ? 1 : functionArg(alphaPart, 0.01)
  if (args.length !== 3 || !Number.isFinite(alpha) || alpha < 0 || alpha > 1)
    return null
  return { channels: args, alpha }
}

/**
 * 一个颜色串解析成哪个色彩空间里的几路数，不取整、不截断；写法错了或分量越界返回 null。
 * rgb 是 0-255 的 sRGB 编码值（hex、rgb()、hsl() 与 color(srgb …) 都落到这里），linear 是线性光，
 * oklab、oklch 照写法原样。
 */
type ParsedColor
  = | { readonly space: 'rgb', readonly r: number, readonly g: number, readonly b: number, readonly alpha: number }
    | { readonly space: 'linear', readonly r: number, readonly g: number, readonly b: number, readonly alpha: number }
    | { readonly space: 'oklab', readonly l: number, readonly a: number, readonly b: number, readonly alpha: number }
    | { readonly space: 'oklch', readonly l: number, readonly c: number, readonly h: number, readonly alpha: number }

function parseColorParts(input: string): ParsedColor | null {
  const raw = input.trim().toLowerCase()
  if (raw === '')
    return null

  const modern = /^(oklch|oklab|color)\(([^)]*)\)$/.exec(raw)
  if (modern) {
    if (modern[1] === 'oklch')
      return parseOklch(modern[2]!)
    if (modern[1] === 'oklab')
      return parseOklab(modern[2]!)
    return parseColorFunction(modern[2]!)
  }

  const matched = /^(rgba?|hsla?)\(([^)]*)\)$/.exec(raw)
  if (!matched) {
    const hex = colorHexToRgba(raw)
    return hex && { space: 'rgb', r: hex.r, g: hex.g, b: hex.b, alpha: hex.a }
  }

  const kind = matched[1]!
  const args = splitArgs(matched[2]!)
  if (args.length !== 3 && args.length !== 4)
    return null
  // 第四个参数（alpha）可以省；`50%` 与 `0.5` 是同一个意思
  const alpha = args.length > 3 ? functionArg(args[3]!, 0.01) : 1
  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1)
    return null

  if (kind.startsWith('rgb')) {
    // r/g/b 写成百分比时以 255 为满值
    const nums = [args[0]!, args[1]!, args[2]!].map(token => functionArg(token, 2.55))
    if (nums.some(n => !Number.isFinite(n) || n < 0 || n > 255))
      return null
    return { space: 'rgb', r: nums[0]!, g: nums[1]!, b: nums[2]!, alpha }
  }

  const h = hueArg(args[0]!)
  const s = functionArg(args[1]!, 1)
  const l = functionArg(args[2]!, 1)
  if (![h, s, l].every(Number.isFinite) || s < 0 || s > 100 || l < 0 || l > 100)
    return null
  const [r, g, b] = hslToRgb255(toDegree(h), s / 100, l / 100)
  return { space: 'rgb', r, g, b, alpha }
}

/** oklch() 的参数：明度写百分数或 0-1 的数，彩度写数或百分数（100% 即 0.4），色相写角度。 */
function parseOklch(body: string): ParsedColor | null {
  const args = modernArgs(body)
  if (!args)
    return null
  const l = functionArg(args.channels[0]!, 0.01)
  const c = functionArg(args.channels[1]!, 0.004)
  const h = hueArg(args.channels[2]!)
  if (![l, c, h].every(Number.isFinite) || l < 0 || l > 1 || c < 0)
    return null
  return { space: 'oklch', l, c, h, alpha: args.alpha }
}

/** oklab() 的参数：明度写百分数或 0-1 的数，a、b 两轴写数或百分数（100% 即 0.4）。 */
function parseOklab(body: string): ParsedColor | null {
  const args = modernArgs(body)
  if (!args)
    return null
  const l = functionArg(args.channels[0]!, 0.01)
  const a = functionArg(args.channels[1]!, 0.004)
  const b = functionArg(args.channels[2]!, 0.004)
  if (![l, a, b].every(Number.isFinite) || l < 0 || l > 1)
    return null
  return { space: 'oklab', l, a, b, alpha: args.alpha }
}

/** color() 的参数：色彩空间只认 srgb 与 srgb-linear，三路写 0-1 的数或百分数。 */
function parseColorFunction(body: string): ParsedColor | null {
  const trimmed = body.trim()
  const gap = trimmed.search(/\s/)
  const space = gap < 0 ? trimmed : trimmed.slice(0, gap)
  if (space !== 'srgb' && space !== 'srgb-linear')
    return null
  const args = modernArgs(trimmed.slice(space.length))
  if (!args)
    return null
  const [r, g, b] = args.channels.map(token => functionArg(token, 0.01)) as [number, number, number]
  if (![r, g, b].every(Number.isFinite))
    return null
  if (space === 'srgb-linear')
    return { space: 'linear', r, g, b, alpha: args.alpha }
  return { space: 'rgb', r: r * 255, g: g * 255, b: b * 255, alpha: args.alpha }
}

/**
 * 任意受支持写法 → RGBA；解析不出返回 null。
 * 支持 `#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa`、`rgb()` / `rgba()`、`hsl()` / `hsla()`、`oklch()`、`oklab()`
 * 与 `color(srgb …)` / `color(srgb-linear …)`；分量写 `none` 时取 0，色相认 deg、grad、rad、turn。
 * 超出 sRGB 的颜色按通道裁剪；分量本身越界（如 `rgb(300 0 0)`、透明度大于 1）返回 null。
 * 不认颜色关键字（`red`、`transparent`），也不认 lab、lch 与其余色彩空间。
 */
export function colorParse(input: string): ColorRgba | null {
  const parsed = parseColorParts(input)
  if (!parsed)
    return null
  if (parsed.space === 'rgb')
    return colorNormalizeRgba({ r: parsed.r, g: parsed.g, b: parsed.b, a: parsed.alpha })
  if (parsed.space === 'linear')
    return colorNormalizeRgba(linearToRgba(parsed.r, parsed.g, parsed.b, parsed.alpha))
  if (parsed.space === 'oklab')
    return colorNormalizeRgba(oklabToRgba(parsed.l, parsed.a, parsed.b, parsed.alpha))
  return colorNormalizeRgba(colorOklchToRgba({ l: parsed.l, c: parsed.c, h: parsed.h, a: parsed.alpha }))
}

/**
 * 任意受支持写法 → OKLCH，不取整到 8 位、不截断到色域；写法与越界规则同 colorParse，解析不出返回 null。
 * oklch() 照写的数原样读；其余写法经线性光换算，无彩色处色相取 0。
 */
export function colorParseOklch(input: string): ColorOklch | null {
  const parsed = parseColorParts(input)
  if (!parsed)
    return null
  if (parsed.space === 'rgb') {
    return colorLinearRgbToOklch(
      colorSrgbToLinear(parsed.r / 255),
      colorSrgbToLinear(parsed.g / 255),
      colorSrgbToLinear(parsed.b / 255),
      parsed.alpha,
    )
  }
  if (parsed.space === 'linear')
    return colorLinearRgbToOklch(parsed.r, parsed.g, parsed.b, parsed.alpha)
  if (parsed.space === 'oklab')
    return oklabToOklch(parsed.l, parsed.a, parsed.b, parsed.alpha, 0)
  return { l: parsed.l, c: parsed.c, h: toDegree(parsed.h), a: parsed.alpha }
}

/* ---------- 写出 ---------- */

/** 按 digits 位小数四舍五入后去掉尾巴零。 */
function fixed(n: number, digits: number): string {
  return String(Number(n.toFixed(digits)))
}

/** 原样写出，-0 写成 0。 */
function exact(n: number): string {
  return Object.is(n, -0) ? '0' : String(n)
}

/**
 * OKLCH → `oklch(l c h)` 串：明度与彩度三位小数、色相两位，彩度先经 colorClampChroma 收进色域；
 * 不透明时省略透明度，半透明时透明度原样写出。
 */
export function colorFormatOklch({ l, c, h, a }: ColorOklch): string {
  const body = `${fixed(l, 3)} ${fixed(colorClampChroma(l, c, h), 3)} ${fixed(h, 2)}`
  const alpha = toAlpha01(a)
  return alpha === 1 ? `oklch(${body})` : `oklch(${body} / ${exact(alpha)})`
}

/** 数值按 digits 位小数取整后去掉尾巴零。 */
function trimNumber(n: number, digits: number): string {
  const scale = 10 ** digits
  return String(Math.round(n * scale) / scale)
}

/** alpha 文本保留三位小数，避免浮点尾巴让相同操作产出不同的串。 */
function alphaText(a: number): string {
  return String(Math.round(toAlpha01(a) * 1000) / 1000)
}

/** RGBA → 对外的值串。alpha 关掉时透明度恒按 1 输出。 */
export function colorToString(rgba: ColorRgba, format: ColorFormat, alpha: boolean): string {
  const color = colorNormalizeRgba({ ...rgba, a: alpha ? rgba.a : 1 })
  if (format === 'rgba')
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alphaText(color.a)})`
  if (format === 'hsla') {
    const hsla = colorRgbaToHsla(color)
    return `hsla(${Math.round(hsla.h)}, ${Math.round(hsla.s)}%, ${Math.round(hsla.l)}%, ${alphaText(color.a)})`
  }
  if (format === 'oklch') {
    // 明度两位百分数、彩度四位、色相两位：往返 8 位 sRGB 不丢一档；不透明时省掉斜杠那一段
    const oklch = colorRgbaToOklch(color)
    const body = `${trimNumber(oklch.l * 100, 2)}% ${trimNumber(oklch.c, 4)} ${trimNumber(oklch.h, 2)}`
    return color.a < 1 ? `oklch(${body} / ${alphaText(color.a)})` : `oklch(${body})`
  }
  // 十六进制：不透明时只写六位
  return colorRgbaToHex(color, alpha && color.a < 1)
}

/** 画在色块上的 CSS 颜色，恒用 rgba() 以保留透明度。 */
export function colorCss(rgba: ColorRgba): string {
  const color = colorNormalizeRgba(rgba)
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alphaText(color.a)})`
}

export function colorSameRgba(a: ColorRgba, b: ColorRgba): boolean {
  const x = colorNormalizeRgba(a)
  const y = colorNormalizeRgba(b)
  // alpha 是浮点，逐字比会被 0.30000000000000004 这种尾巴绊倒；差在千分之一内即同色
  return x.r === y.r && x.g === y.g && x.b === y.b && Math.abs(x.a - y.a) < 0.001
}

/** 两个值串是不是同一个颜色。写法不同（`#f00` 与 `rgb(255,0,0)`）也算同一个。 */
export function colorSameColor(a: string, b: string): boolean {
  const x = colorParse(a)
  const y = colorParse(b)
  return !!x && !!y && colorSameRgba(x, y)
}
