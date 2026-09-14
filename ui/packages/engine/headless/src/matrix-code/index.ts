/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 matrix code 模块的公共接口。

export { DM_SYMBOLS, dmCapacity, dmEncode } from './dm-encode'
export type { DmEncodeOptions, DmMatrix, DmSymbol } from './dm-encode'
export { matrixCodeAnatomy } from './matrix-code.anatomy'
export { connectMatrixCode } from './matrix-code.connect'
export { matrixCodeKeyboard } from './matrix-code.keyboard'
export { matrixCodeMeta } from './matrix-code.meta'
export type { MatrixCodeApi, MatrixCodeEyeShape, MatrixCodeFormat, MatrixCodeLogoArea, MatrixCodeLogoDamage, MatrixCodeModuleShape, MatrixCodeProps, MatrixCodeState, MatrixCodeTranslations } from './matrix-code.types'
export { QR_MAX_VERSION, qrAlignmentPositions, qrCapacityBytes, qrEncode } from './qr-encode'
export type { QrEncodeOptions, QrLevel, QrMatrix } from './qr-encode'
export { createReedSolomon } from './reed-solomon'
export type { ReedSolomon } from './reed-solomon'
