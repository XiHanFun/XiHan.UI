// 颜色换算这一路的纯函数：不碰 DOM、不认识状态机，单独测。
// 之所以整块拎出来，是因为取色器的坑几乎全在这里——三/四/六/八位十六进制的写法差异、
// 用户在输入框里打到一半的半截串、灰度色算不出色相、格式往返后的舍入误差——
// 放进机器会被状态转移淹没，也就没法逐条钉死。
//
// 内部工作色一律用 HSVA：二维取色区的两条轴正是饱和度与明度，
// 用 RGB 表达的话每挪一格都要反解一次，且灰度处会把色相丢光。
import { clamp } from '../shared/number'

export type ColorPickerFormat = 'hex' | 'rgba' | 'hsla'

/** 两条通道滑杆各自调的是哪一路。 */
export type ColorPickerChannel = 'hue' | 'alpha'

/** 数值输入框各自编辑的是哪一路：十六进制整串，或 rgb 三个分量与透明度。 */
export type ColorPickerInputChannel = 'hex' | 'r' | 'g' | 'b' | 'a'

const CHANNELS: readonly ColorPickerChannel[] = ['hue', 'alpha']
const INPUT_CHANNELS: readonly ColorPickerInputChannel[] = ['hex', 'r', 'g', 'b', 'a']

/**
 * 把作者写在部件上的声明收成一条真实存在的通道。
 *
 * 声明是字符串（Vue 的 :channel、WC 的 channel 属性），漏写、写错都是可能的；
 * 不收的话会一路变成 aria-label="undefined" 与一条谁也调不动的滑杆。
 * 两个适配器共用这一份归一，同样的作者标记才产出同样的结果。
 */
export function colorPickerToChannel(raw: string | undefined): ColorPickerChannel {
  return CHANNELS.find(channel => channel === raw) ?? 'hue'
}

export function colorPickerToInputChannel(raw: string | undefined): ColorPickerInputChannel {
  return INPUT_CHANNELS.find(channel => channel === raw) ?? 'hex'
}

/** 一条通道的取值区间与两档步长。 */
export interface ColorPickerChannelRange {
  min: number
  max: number
  step: number
  /** Shift + 方向键的步长。 */
  largeStep: number
}

/** r/g/b 是 0-255 的整数，a 是 0-1 的小数。 */
export interface ColorPickerRgba {
  r: number
  g: number
  b: number
  a: number
}

/** h 是 0-360 的角度，s/v 是 0-100 的百分数，a 是 0-1 的小数。 */
export interface ColorPickerHsva {
  h: number
  s: number
  v: number
  a: number
}

/** h 是 0-360 的角度，s/l 是 0-100 的百分数，a 是 0-1 的小数。 */
export interface ColorPickerHsla {
  h: number
  s: number
  l: number
  a: number
}

/**
 * 工作色的锚：某个 HSVA 与它序列化出来的那个串。
 *
 * 灰度与纯黑处色相是算不出来的（r=g=b 时色相无定义），只按当前值反解的话，
 * 用户把取色区拖到最下沿再拖回来，色相就变成了 0（红），这是取色器最常见的塌陷。
 * 锚记住"这个串是由哪个 HSVA 产出的"，串没变就沿用原来的色相。
 */
export interface ColorPickerAnchor {
  value: string
  hsva: ColorPickerHsva
}

/** 解析不出颜色时的兜底串（作者传了半截串、传了空串都会落到这里）。 */
export const COLOR_PICKER_FALLBACK = '#000000'

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

/** 各通道夹回合法区间并把 r/g/b 取整。比较两个颜色前必须先过这一道，否则 254.6 与 255 会被判成不同色。 */
export function colorPickerNormalizeRgba(rgba: ColorPickerRgba): ColorPickerRgba {
  return {
    r: toChannel255(rgba.r),
    g: toChannel255(rgba.g),
    b: toChannel255(rgba.b),
    a: toAlpha01(rgba.a),
  }
}

export function colorPickerNormalizeHsva(hsva: ColorPickerHsva): ColorPickerHsva {
  return {
    h: toDegree(hsva.h),
    s: toPercent(hsva.s),
    v: toPercent(hsva.v),
    a: toAlpha01(hsva.a),
  }
}

/**
 * 十六进制串 → RGBA。接受 3/4/6/8 位，`#` 可省（输入框里用户多半不打它）。
 * 位数不对（打了一半的 `#3b8`… 之类）一律返回 null，让调用方决定是保留草稿还是复原。
 */
export function colorPickerHexToRgba(input: string): ColorPickerRgba | null {
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
export function colorPickerRgbaToHex(rgba: ColorPickerRgba, withAlpha = false): string {
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
 * hueHint 是灰度色的色相兜底：纯黑、纯白、任何灰都算不出色相，
 * 不给兜底就会一律落到 0（红），用户在取色区里往下拖一下再拖回来，颜色就换了个色系。
 */
export function colorPickerRgbaToHsva(rgba: ColorPickerRgba, hueHint = 0): ColorPickerHsva {
  const { r, g, b, a } = colorPickerNormalizeRgba(rgba)
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

export function colorPickerHsvaToRgba(hsva: ColorPickerHsva): ColorPickerRgba {
  const { h, s, v, a } = colorPickerNormalizeHsva(hsva)
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

export function colorPickerRgbaToHsla(rgba: ColorPickerRgba, hueHint = 0): ColorPickerHsla {
  const { r, g, b, a } = colorPickerNormalizeRgba(rgba)
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255
  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  const delta = max - min
  const l = (max + min) / 2
  // 分母在纯黑/纯白处趋近 0，此时饱和度无定义，直接取 0（不能除下去，会得到 Infinity）
  const denominator = 1 - Math.abs(2 * l - 1)
  return {
    h: hueOf(rr, gg, bb, max, delta, hueHint),
    s: delta === 0 || denominator === 0 ? 0 : (delta / denominator) * 100,
    l: l * 100,
    a,
  }
}

export function colorPickerHslaToRgba(hsla: ColorPickerHsla): ColorPickerRgba {
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
 * 刻意不认颜色关键字（`red`、`transparent`）：那需要一张随浏览器版本走的名字表，
 * 而取色器的取值口径必须是确定的。
 */
export function colorPickerParse(input: string): ColorPickerRgba | null {
  const raw = input.trim().toLowerCase()
  if (raw === '')
    return null

  const matched = /^(rgba?|hsla?)\(([^)]*)\)$/.exec(raw)
  if (!matched)
    return colorPickerHexToRgba(raw)

  const kind = matched[1]!
  const args = splitArgs(matched[2]!)
  if (args.length < 3)
    return null
  // 第四个参数（alpha）可以省；`50%` 与 `0.5` 是同一个意思
  const alpha = args.length > 3 ? functionArg(args[3]!, 0.01) : 1
  if (!Number.isFinite(alpha))
    return null

  if (kind.startsWith('rgb')) {
    // r/g/b 写成百分比时以 255 为满值
    const nums = [args[0]!, args[1]!, args[2]!].map(token => functionArg(token, 2.55))
    if (nums.some(n => !Number.isFinite(n)))
      return null
    return colorPickerNormalizeRgba({ r: nums[0]!, g: nums[1]!, b: nums[2]!, a: alpha })
  }

  const h = functionArg(args[0]!, 1)
  const s = functionArg(args[1]!, 1)
  const l = functionArg(args[2]!, 1)
  if (![h, s, l].every(Number.isFinite))
    return null
  return colorPickerHslaToRgba({ h, s, l, a: alpha })
}

/** 小数尾巴留三位就够：alpha 再精细人眼也分不出，而尾巴会让两次相同的操作产出不同的串。 */
function alphaText(a: number): string {
  return String(Math.round(toAlpha01(a) * 1000) / 1000)
}

/**
 * RGBA → 对外的值串。alpha 关掉时透明度恒按 1 输出：
 * 组件不带透明度却吐出一个半透明值，调用方拿去用会莫名其妙。
 */
export function colorPickerToString(rgba: ColorPickerRgba, format: ColorPickerFormat, alpha: boolean): string {
  const color = colorPickerNormalizeRgba({ ...rgba, a: alpha ? rgba.a : 1 })
  if (format === 'rgba')
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alphaText(color.a)})`
  if (format === 'hsla') {
    const hsla = colorPickerRgbaToHsla(color)
    return `hsla(${Math.round(hsla.h)}, ${Math.round(hsla.s)}%, ${Math.round(hsla.l)}%, ${alphaText(color.a)})`
  }
  // 十六进制：不透明时只写六位，八位写法在不少地方（老浏览器、设计稿）反而认不出来
  return colorPickerRgbaToHex(color, alpha && color.a < 1)
}

/** 画在色块上的 CSS 颜色。恒用 rgba()：十六进制不带透明度时色块会显得比实际值更实。 */
export function colorPickerCss(rgba: ColorPickerRgba): string {
  const color = colorPickerNormalizeRgba(rgba)
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alphaText(color.a)})`
}

/** 取色区的底色：当前色相的纯色。饱和度与明度的两层渐变由皮肤盖在它上面。 */
export function colorPickerHueCss(hue: number): string {
  return `hsl(${Math.round(toDegree(hue))}, 100%, 50%)`
}

export function colorPickerSameRgba(a: ColorPickerRgba, b: ColorPickerRgba): boolean {
  const x = colorPickerNormalizeRgba(a)
  const y = colorPickerNormalizeRgba(b)
  // alpha 是浮点，逐字比会被 0.30000000000000004 这种尾巴绊倒；差在千分之一内即同色
  return x.r === y.r && x.g === y.g && x.b === y.b && Math.abs(x.a - y.a) < 0.001
}

/** 两个值串是不是同一个颜色。写法不同（`#f00` 与 `rgb(255,0,0)`）也算同一个。 */
export function colorPickerSameColor(a: string, b: string): boolean {
  const x = colorPickerParse(a)
  const y = colorPickerParse(b)
  return !!x && !!y && colorPickerSameRgba(x, y)
}

/**
 * 由当前值串结算出工作色。
 * 锚记的串与当前值逐字相同 = 这个串正是那次操作产出的，沿用锚里的 HSVA（色相因此不丢）；
 * 否则说明值是从外面写进来的，老老实实反解。
 *
 * 逐字比而不是比颜色：hsla 写法会把百分数舍进整数，往返一趟颜色就差了一点点，
 * 按颜色比会在拖动途中随机失配，色相跟着一跳一跳。
 */
export function colorPickerResolveHsva(value: string, anchor: ColorPickerAnchor | null): ColorPickerHsva {
  if (anchor && anchor.value === value)
    return anchor.hsva
  return colorPickerRgbaToHsva(colorPickerToRgba(value), anchor?.hsva.h ?? 0)
}

/**
 * 解析值串，解析不出就退到兜底色。
 * 展示用途（色块背景、预设色板）走这条：一个写错的串不该让整块颜色消失，
 * 而改值那条路必须走 colorPickerParse 自己判 null——那里猜一个颜色出来就是篡改用户的值。
 */
export function colorPickerToRgba(value: string): ColorPickerRgba {
  return colorPickerParse(value) ?? colorPickerParse(COLOR_PICKER_FALLBACK)!
}

/**
 * 两条通道的区间。
 * 透明度对外一律按 0-100 走（而不是内部那个 0-1 的小数）：读屏念 "80" 比念 "0.8" 好懂，
 * 方向键一格也才有个确定的手感——按 0-1 算的话一格要么大得离谱要么小得没反应。
 */
export function colorPickerChannelRange(channel: ColorPickerChannel): ColorPickerChannelRange {
  return channel === 'hue'
    ? { min: 0, max: 360, step: 1, largeStep: 10 }
    : { min: 0, max: 100, step: 1, largeStep: 10 }
}

/** 取某条通道当前的对外数值（色相是角度，透明度是百分数）。 */
export function colorPickerChannelValue(hsva: ColorPickerHsva, channel: ColorPickerChannel): number {
  return channel === 'hue' ? hsva.h : hsva.a * 100
}

/** 把某条通道改成 next（对外数值），夹回区间后返回新的工作色。 */
export function colorPickerWithChannel(hsva: ColorPickerHsva, channel: ColorPickerChannel, next: number): ColorPickerHsva {
  const range = colorPickerChannelRange(channel)
  const safe = Number.isFinite(next) ? clamp(next, range.min, range.max) : colorPickerChannelValue(hsva, channel)
  return channel === 'hue' ? { ...hsva, h: safe } : { ...hsva, a: safe / 100 }
}

/** 取色区的两条轴：横轴饱和度、纵轴明度，都是 0-100。 */
export function colorPickerWithArea(hsva: ColorPickerHsva, axis: 'x' | 'y', next: number): ColorPickerHsva {
  const safe = Number.isFinite(next) ? clamp(next, 0, 100) : (axis === 'x' ? hsva.s : hsva.v)
  return axis === 'x' ? { ...hsva, s: safe } : { ...hsva, v: safe }
}

/** 输入框里该显示的规范文本（用户没在这个框里打字时用它）。 */
export function colorPickerInputText(hsva: ColorPickerHsva, channel: ColorPickerInputChannel, alpha: boolean): string {
  const rgba = colorPickerHsvaToRgba(hsva)
  if (channel === 'hex')
    return colorPickerRgbaToHex(rgba, alpha && rgba.a < 1)
  if (channel === 'a')
    return String(Math.round(rgba.a * 100))
  return String(rgba[channel])
}

/**
 * 把输入框里的一串字收成新的工作色；收不了（打了一半、打了非法字符）返回 null，
 * 由调用方决定是留着草稿还是复原——绝不能猜一个颜色出来，那会在用户打字途中乱跳。
 */
export function colorPickerApplyInput(
  hsva: ColorPickerHsva,
  channel: ColorPickerInputChannel,
  text: string,
  alpha: boolean,
): ColorPickerHsva | null {
  const raw = text.trim()
  if (raw === '')
    return null

  if (channel === 'hex') {
    const rgba = colorPickerHexToRgba(raw)
    if (!rgba)
      return null
    // 六位写法不带透明度：保留当前透明度，别把用户刚调好的半透明冲成不透明
    const hasAlpha = /^#?(?:[0-9a-f]{4}|[0-9a-f]{8})$/i.test(raw)
    return colorPickerRgbaToHsva({ ...rgba, a: hasAlpha && alpha ? rgba.a : hsva.a }, hsva.h)
  }

  const n = Number(raw)
  if (!Number.isFinite(n))
    return null
  if (channel === 'a')
    return colorPickerWithChannel(hsva, 'alpha', n)

  const rgba = colorPickerHsvaToRgba(hsva)
  // 色相经 hint 带过去：把某个分量调到与另两个相等（灰）时，色相本来会塌成红
  return colorPickerRgbaToHsva({ ...rgba, [channel]: clamp(n, 0, 255) }, hsva.h)
}
