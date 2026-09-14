/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 bar code 模块的公共接口。

export { barCodeAnatomy } from './bar-code.anatomy'
export { connectBarCode } from './bar-code.connect'
export { barCodeKeyboard } from './bar-code.keyboard'
export { barCodeMeta } from './bar-code.meta'
export type { BarCodeApi, BarCodeFormat, BarCodeProps, BarCodeState, BarCodeTextRun, BarCodeTranslations } from './bar-code.types'
export { BAR_FNC1_CHAR, barEncode, gs1CheckDigit, upceExpand } from './bar-encode'
export type { BarEncodeOptions, BarSymbol, BarText } from './bar-encode'
