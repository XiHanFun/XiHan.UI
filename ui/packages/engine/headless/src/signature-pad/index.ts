/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 signature pad 模块的公共接口。

export { signaturePadAnatomy } from './signature-pad.anatomy'
export { connectSignaturePad } from './signature-pad.connect'
export {
  pathFromPoints,
  SIGNATURE_PAD_SIZE,
  signaturePadSvg,
  simulatedPressure,
  strokeRadius,
  strokesToPaths,
} from './signature-pad.geometry'
export { signaturePadKeyboard } from './signature-pad.keyboard'
export { EMPTY_SIGNATURE, signaturePadMachine } from './signature-pad.machine'
export { signaturePadMeta } from './signature-pad.meta'
export type {
  SignaturePadApi,
  SignaturePadDraft,
  SignaturePadDrawDetails,
  SignaturePadDrawEndDetails,
  SignaturePadDrawingOptions,
  SignaturePadPoint,
  SignaturePadPointerPoint,
  SignaturePadSchema,
  SignaturePadStroke,
  SignaturePadSurface,
  SignaturePadTranslations,
  SignaturePadTrigger,
  SignaturePadValue,
  SignaturePadValueChangeDetails,
} from './signature-pad.types'
