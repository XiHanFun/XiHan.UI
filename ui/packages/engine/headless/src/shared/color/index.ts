/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 shared/color 模块的公共接口：颜色换算纯函数与 Color 家族共用的契约。

export {
  COLOR_CHANNELS,
  COLOR_FALLBACK,
  colorChannelRange,
  colorChannelValue,
  colorCss,
  colorHexToRgba,
  colorHslaToRgba,
  colorHsvaToRgba,
  colorHueCss,
  colorNormalizeHsva,
  colorNormalizeRgba,
  colorParse,
  colorResolveFormat,
  colorResolveHsva,
  colorRgbaToHex,
  colorRgbaToHsla,
  colorRgbaToHsva,
  colorSameColor,
  colorSameRgba,
  colorToChannel,
  colorToRgba,
  colorToString,
  colorWithChannel,
} from './color'
export type {
  ColorAnchor,
  ColorChannel,
  ColorChannelRange,
  ColorFormat,
  ColorHsla,
  ColorHsva,
  ColorRgba,
} from './color'
