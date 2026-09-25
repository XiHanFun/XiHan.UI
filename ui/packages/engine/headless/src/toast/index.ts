/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 toast 模块的公共接口。

export { toastAnatomy } from './toast.anatomy'
export { connectToast } from './toast.connect'
export { toastKeyboard } from './toast.keyboard'
export {
  resolveToastDuration,
  resolveToastId,
  TOAST_DURATION,
  TOAST_GAP,
  TOAST_MAX,
  TOAST_PLACEMENT,
  toastMachine,
} from './toast.machine'
export { toastMeta } from './toast.meta'
export { resolveToastServiceItem } from './toast.service'
export { createToastStackController } from './toast.stack'
export type { ToastStackController, ToastStackControllerOptions } from './toast.stack'
export type {
  ResolvedToastServiceItem,
  ToastActionDetails,
  ToastApi,
  ToastOptions,
  ToastPauseSource,
  ToastPlacement,
  ToastPressedPart,
  ToastRecord,
  ToastSchema,
  ToastServiceDefaults,
  ToastStatus,
  ToastStatusChangeDetails,
  ToastTone,
  ToastTranslations,
} from './toast.types'
