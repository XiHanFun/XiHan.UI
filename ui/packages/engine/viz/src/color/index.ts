/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 color 模块的公共接口。

export { contrastRatio, deltaEOk, relativeLuminance, simulateCvd } from './metrics'
export type { CvdKind } from './metrics'
export { validateCategoricalPalette, validateOrdinalRamp } from './palette'
export type {
  CategoricalPaletteOptions,
  OrdinalRampOptions,
  PaletteCheck,
  PaletteCheckId,
  PaletteFinding,
  PaletteMode,
  PaletteReport,
  PaletteStatus,
} from './palette'
export { parseColor } from './parse'
export { formatHex, fromOklab, fromOklch, oklabToOklch, oklchToOklab, toOklab, toOklch } from './space'
export type { Oklab, Oklch, Rgba } from './space'
