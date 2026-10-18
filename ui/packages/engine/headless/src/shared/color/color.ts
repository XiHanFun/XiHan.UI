/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// Color 家族的工作色与通道：颜色换算本身在 @xihan-ui/core/color，这里只加取色用的那一层。
// 内部工作色一律用 HSVA；取色区的两条轴、通道滑杆的每一路都从它上面取值、往它上面写。
// color-picker / color-slider / color-field / color-swatch(-picker) 共用这一份，各自只加自己的编排。
import type { ColorFormat, ColorHsva, ColorRgba } from '@xihan-ui/core/color'
import { colorHsvaToRgba, colorParse, colorRgbaToHsva } from '@xihan-ui/core/color'
import { clamp } from '../number'

const COLOR_FORMATS: readonly ColorFormat[] = ['hex', 'rgba', 'hsla', 'oklch']

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

/** 角度归一到 [0, 360)。负角与超过一圈的角都收得回来。 */
function toDegree(n: number): number {
  if (!Number.isFinite(n))
    return 0
  const wrapped = n % 360
  return wrapped < 0 ? wrapped + 360 : wrapped
}

/** 某个色相的纯色：取色区的底色、色相带上的一档都是它。 */
export function colorHueCss(hue: number): string {
  return `hsl(${Math.round(toDegree(hue))}, 100%, 50%)`
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
