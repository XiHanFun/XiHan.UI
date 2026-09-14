/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 颜色换算的纯函数层：不碰 DOM、不认识状态机。
// 内部工作色一律用 HSVA；取色区的两条轴、通道滑杆的每一路都从它上面取值、往它上面写。
// color-picker / color-slider / color-field / color-swatch(-picker) 共用这一份，各自只加自己的编排。
import { clamp } from '../number'

export type ColorFormat = 'hex' | 'rgba' | 'hsla'

const COLOR_FORMATS: readonly ColorFormat[] = ['hex', 'rgba', 'hsla']

/** 未指定格式时取 hex；运行期写入未知格式时返回 null，不静默伪装成 hex。 */
export function colorResolveFormat(format: string | undefined): ColorFormat | null {
  if (format === undefined)
    return 'hex'
  return COLOR_FORMATS.find(candidate => candidate === format) ?? null
}

/**
 * 一条可以单独推动的通道：HSV 三路、RGB 三路与透明度。
 * 对外数值各有各的尺：色相是角度 0-360，饱和度 / 明度 / 透明度是百分数 0-100，红绿蓝是 0-255。
 */
export type ColorChannel = 'hue' | 'saturation' | 'brightness' | 'alpha' | 'red' | 'green' | 'blue'

export const COLOR_CHANNELS: readonly ColorChannel[] = ['hue', 'saturation', 'brightness', 'alpha', 'red', 'green', 'blue']

/** 把作者写在部件上的通道声明收成一条真实存在的通道；漏写或写错时退到 hue。 */
export function colorToChannel(raw: string | undefined): ColorChannel {
  return COLOR_CHANNELS.find(channel => channel === raw) ?? 'hue'
}

/** 一条通道的取值区间与两档步长。 */
export interface ColorChannelRange {
  min: number
  max: number
  step: number
  /** Shift + 方向键 / PageUp / PageDown 的步长。 */
  largeStep: number
}

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

/**
 * 工作色的锚：某个 HSVA 与它序列化出来的那个串。
 *
 * 灰度与纯黑处色相无定义，锚记住串由哪个 HSVA 产出，串没变就沿用原色相。
 */
export interface ColorAnchor {
  value: string
  hsva: ColorHsva
}

/** 解析不出颜色时的兜底串（作者传了半截串、传了空串都会落到这里）。 */
export const COLOR_FALLBACK = '#000000'

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

export function colorHslaToRgba(hsla: ColorHsla): ColorRgba {
  const h = toDegree(hsla.h)
  const s = toPercent(hsla.s) / 100
  const l = toPercent(hsla.l) / 100
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
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: toAlpha01(hsla.a),
  }
}

/** 函数式记法里的一个参数：`50%` 按 scale 换算，`210deg` 去掉单位，其余按裸数取。 */
function functionArg(token: string, scale: number): number {
  const raw = token.trim()
  if (raw.endsWith('%'))
    return Number(raw.slice(0, -1)) * scale
  if (raw.endsWith('deg'))
    return Number(raw.slice(0, -3))
  return Number(raw)
}

function splitArgs(body: string): string[] {
  // 逗号、空白、斜杠三种分隔写法都收：rgb(1 2 3 / 50%) 与 rgba(1,2,3,0.5) 是同一件事
  return body.split(/[\s,/]+/).filter(Boolean)
}

/**
 * 任意受支持写法 → RGBA；解析不出返回 null。
 * 支持 `#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa`、`rgb()` / `rgba()`、`hsl()` / `hsla()`。
 * 不认颜色关键字（`red`、`transparent`）。
 */
export function colorParse(input: string): ColorRgba | null {
  const raw = input.trim().toLowerCase()
  if (raw === '')
    return null

  const matched = /^(rgba?|hsla?)\(([^)]*)\)$/.exec(raw)
  if (!matched)
    return colorHexToRgba(raw)

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
    return colorNormalizeRgba({ r: nums[0]!, g: nums[1]!, b: nums[2]!, a: alpha })
  }

  const h = functionArg(args[0]!, 1)
  const s = functionArg(args[1]!, 1)
  const l = functionArg(args[2]!, 1)
  if (![h, s, l].every(Number.isFinite) || s < 0 || s > 100 || l < 0 || l > 100)
    return null
  return colorHslaToRgba({ h, s, l, a: alpha })
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
  // 十六进制：不透明时只写六位
  return colorRgbaToHex(color, alpha && color.a < 1)
}

/** 画在色块上的 CSS 颜色，恒用 rgba() 以保留透明度。 */
export function colorCss(rgba: ColorRgba): string {
  const color = colorNormalizeRgba(rgba)
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alphaText(color.a)})`
}

/** 某个色相的纯色：取色区的底色、色相带上的一档都是它。 */
export function colorHueCss(hue: number): string {
  return `hsl(${Math.round(toDegree(hue))}, 100%, 50%)`
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

/**
 * 由当前值串结算出工作色：与锚记的串逐字相同就沿用锚里的 HSVA，否则反解。
 *
 * 必须逐字比而非比颜色，hsla 往返有舍入误差，按颜色比会在拖动途中随机失配。
 */
export function colorResolveHsva(value: string, anchor: ColorAnchor | null): ColorHsva {
  if (anchor && anchor.value === value)
    return anchor.hsva
  return colorRgbaToHsva(colorToRgba(value), anchor?.hsva.h ?? 0)
}

/**
 * 解析值串，解析不出就退到兜底色。仅供展示用途；
 * 改值那条路必须走 colorParse 自己判 null。
 */
export function colorToRgba(value: string): ColorRgba {
  return colorParse(value) ?? colorParse(COLOR_FALLBACK)!
}

/** 每条通道的区间。透明度对外按 0-100 走，不是内部那个 0-1 的小数；红绿蓝按 0-255。 */
export function colorChannelRange(channel: ColorChannel): ColorChannelRange {
  if (channel === 'hue')
    return { min: 0, max: 360, step: 1, largeStep: 10 }
  if (channel === 'red' || channel === 'green' || channel === 'blue')
    return { min: 0, max: 255, step: 1, largeStep: 10 }
  return { min: 0, max: 100, step: 1, largeStep: 10 }
}

/** 取某条通道当前的对外数值（色相是角度，饱和度 / 明度 / 透明度是百分数，红绿蓝是 0-255）。 */
export function colorChannelValue(hsva: ColorHsva, channel: ColorChannel): number {
  switch (channel) {
    case 'hue': return hsva.h
    case 'saturation': return hsva.s
    case 'brightness': return hsva.v
    case 'alpha': return hsva.a * 100
    case 'red': return colorHsvaToRgba(hsva).r
    case 'green': return colorHsvaToRgba(hsva).g
    case 'blue': return colorHsvaToRgba(hsva).b
  }
}

/** 把某条通道改成 next（对外数值），夹回区间后返回新的工作色。 */
export function colorWithChannel(hsva: ColorHsva, channel: ColorChannel, next: number): ColorHsva {
  const range = colorChannelRange(channel)
  const safe = Number.isFinite(next) ? clamp(next, range.min, range.max) : colorChannelValue(hsva, channel)
  switch (channel) {
    case 'hue': return { ...hsva, h: safe }
    case 'saturation': return { ...hsva, s: safe }
    case 'brightness': return { ...hsva, v: safe }
    case 'alpha': return { ...hsva, a: safe / 100 }
    case 'red':
    case 'green':
    case 'blue': {
      // 红绿蓝改的是 RGB 空间里的一路；色相经 hint 带过去，调成灰时色相不塌成 0
      const rgba = colorHsvaToRgba(hsva)
      const key = channel === 'red' ? 'r' : channel === 'green' ? 'g' : 'b'
      return colorRgbaToHsva({ ...rgba, [key]: safe }, hsva.h)
    }
  }
}
