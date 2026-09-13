/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 qr code 模块的公共接口。

export { qrCodeAnatomy } from './qr-code.anatomy'
export { connectQrCode } from './qr-code.connect'
export { qrCodeKeyboard } from './qr-code.keyboard'
export { qrCodeMeta } from './qr-code.meta'
export type { QrCodeApi, QrCodeLogoArea, QrCodeLogoDamage, QrCodeProps, QrCodeState, QrCodeTranslations, QrEyeShape, QrModuleShape } from './qr-code.types'
export { QR_MAX_VERSION, qrAlignmentPositions, qrCapacityBytes, qrEncode } from './qr-encode'
export type { QrLevel, QrMatrix } from './qr-encode'
