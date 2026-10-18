/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// Color 家族在包内取颜色能力的一处：换算从 @xihan-ui/core/color 转过来，工作色与通道是这里自己的。

export {
  COLOR_CHANNELS,
  COLOR_FALLBACK,
  colorChannelRange,
  colorChannelValue,
  colorHueCss,
  colorResolveFormat,
  colorResolveHsva,
  colorToChannel,
  colorToRgba,
  colorWithChannel,
} from './color'
export type { ColorAnchor, ColorChannel, ColorChannelRange } from './color'
export {
  colorCss,
  colorHexToRgba,
  colorHsvaToRgba,
  colorParse,
  colorRgbaToHex,
  colorRgbaToHsva,
  colorSameColor,
  colorToString,
} from '@xihan-ui/core/color'
export type { ColorFormat, ColorHsva, ColorRgba } from '@xihan-ui/core/color'
