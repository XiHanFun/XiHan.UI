/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 取色器自己那几路的换算：两条通道滑杆、二维取色区与数值输入框。
// 颜色本身的解析、序列化与空间互转在 shared/color。
import type { ColorChannelRange, ColorHsva } from '../shared/color'
import { colorChannelRange, colorChannelValue, colorHexToRgba, colorHsvaToRgba, colorRgbaToHex, colorRgbaToHsva, colorWithChannel } from '../shared/color'
import { clamp } from '../shared/number'

/** 两条通道滑杆各自调的是哪一路。 */
export type ColorPickerChannel = 'hue' | 'alpha'

/** 数值输入框各自编辑的是哪一路：十六进制整串，或 rgb 三个分量与透明度。 */
export type ColorPickerInputChannel = 'hex' | 'r' | 'g' | 'b' | 'a'

const CHANNELS: readonly ColorPickerChannel[] = ['hue', 'alpha']
const INPUT_CHANNELS: readonly ColorPickerInputChannel[] = ['hex', 'r', 'g', 'b', 'a']

/** 把作者写在部件上的通道声明收成一条真实存在的通道；漏写或写错时退到 hue。 */
export function colorPickerToChannel(raw: string | undefined): ColorPickerChannel {
  return CHANNELS.find(channel => channel === raw) ?? 'hue'
}

export function colorPickerToInputChannel(raw: string | undefined): ColorPickerInputChannel {
  return INPUT_CHANNELS.find(channel => channel === raw) ?? 'hex'
}

/** 两条通道的区间。透明度对外按 0-100 走，不是内部那个 0-1 的小数。 */
export function colorPickerChannelRange(channel: ColorPickerChannel): ColorChannelRange {
  return colorChannelRange(channel)
}

/** 取某条通道当前的对外数值（色相是角度，透明度是百分数）。 */
export function colorPickerChannelValue(hsva: ColorHsva, channel: ColorPickerChannel): number {
  return colorChannelValue(hsva, channel)
}

/** 把某条通道改成 next（对外数值），夹回区间后返回新的工作色。 */
export function colorPickerWithChannel(hsva: ColorHsva, channel: ColorPickerChannel, next: number): ColorHsva {
  return colorWithChannel(hsva, channel, next)
}

/** 取色区的两条轴：横轴饱和度、纵轴明度，都是 0-100。 */
export function colorPickerWithArea(hsva: ColorHsva, axis: 'x' | 'y', next: number): ColorHsva {
  const safe = Number.isFinite(next) ? clamp(next, 0, 100) : (axis === 'x' ? hsva.s : hsva.v)
  return axis === 'x' ? { ...hsva, s: safe } : { ...hsva, v: safe }
}

/** 输入框里该显示的规范文本（用户没在这个框里打字时用它）。 */
export function colorPickerInputText(hsva: ColorHsva, channel: ColorPickerInputChannel, alpha: boolean): string {
  const rgba = colorHsvaToRgba(hsva)
  if (channel === 'hex')
    return colorRgbaToHex(rgba, alpha && rgba.a < 1)
  if (channel === 'a')
    return String(Math.round(rgba.a * 100))
  return String(rgba[channel])
}

/** 把输入框里的一串字收成新的工作色；收不了返回 null，由调用方决定留草稿还是复原。 */
export function colorPickerApplyInput(
  hsva: ColorHsva,
  channel: ColorPickerInputChannel,
  text: string,
  alpha: boolean,
): ColorHsva | null {
  const raw = text.trim()
  if (raw === '')
    return null

  if (channel === 'hex') {
    const rgba = colorHexToRgba(raw)
    if (!rgba)
      return null
    // 六位写法不带透明度，此时保留当前透明度
    const hasAlpha = /^#?(?:[0-9a-f]{4}|[0-9a-f]{8})$/i.test(raw)
    return colorRgbaToHsva({ ...rgba, a: hasAlpha && alpha ? rgba.a : hsva.a }, hsva.h)
  }

  const n = Number(raw)
  if (!Number.isFinite(n))
    return null
  if (channel === 'a') {
    if (n < 0 || n > 100)
      return null
    return colorWithChannel(hsva, 'alpha', n)
  }
  if (n < 0 || n > 255)
    return null

  const rgba = colorHsvaToRgba(hsva)
  // 色相经 hint 带过去，调成灰时色相会塌成 0
  return colorRgbaToHsva({ ...rgba, [channel]: clamp(n, 0, 255) }, hsva.h)
}
